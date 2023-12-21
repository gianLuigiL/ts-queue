import type { Resolvers, Jobs, Params, OnSuccess, OnError } from "./types";

const noop = () => {};

const useQueue = <T extends Resolvers>({
  resolvers,
  onSuccess = noop,
  onCleared = noop,
  onError = noop,
  concurrency = 1,
}: Params<T>) => {
  let jobs: Jobs<T>[] = [];
  let currentIndex = 0;

  const process = async (): Promise<void> => {
    if (currentIndex > concurrency) {
      return;
    }
    while (currentIndex < concurrency) {
      const job = jobs[currentIndex++];
      if (!job) {
        currentIndex--;
        return;
      }

      const resolver = resolvers[job.type];
      if (!resolver)
        throw new Error(
          `No resolver defined for job type "${job.type.toString()}"`
        );
      new Promise(async (resolve) => {
        let res: any;
        if ("params" in job) {
          res = await resolver(job.params);

          const data = {
            type: job.type,
            params: job.params,
            result: res,
          } as Extract<Parameters<OnSuccess<T>>[0], { params: any }>;
          onSuccess(data);
        } else res = await resolver(undefined);
        const data = {
          type: job.type,
          result: res,
        } as Extract<Parameters<OnSuccess<T>>[0], { params: never }>;
        onSuccess(data);
        resolve(null);
      })
        .catch((error) => {
          const data = {
            type: job.type,
            params: "params" in job ? job.params : undefined,
            error: error,
          } as Parameters<OnError<T>>[0];
          onError(data);
        })
        .finally(() => {
          const index = jobs.indexOf(job);
          jobs.splice(index, 1);
          currentIndex--;
          if (jobs.length) return new Promise(() => process());
          onCleared();
        });
    }
  };

  const addJobs = (...job: (typeof jobs)[number][]) => {
    jobs.push(...job);
    process();
  };

  const addIf = (
    job: (typeof jobs)[number],
    iteratee: (arr: typeof jobs) => boolean
  ) => {
    if (iteratee(jobs)) addJobs(job);
  };

  const filterJobs = (
    iteratee: (
      element: (typeof jobs)[number],
      index: number,
      arr: typeof jobs
    ) => boolean
  ) => {
    jobs = jobs
      .slice(0, currentIndex + 1)
      .concat(jobs.slice(currentIndex + 1).filter(iteratee));
  };

  return {
    addJobs,
    addIf,
    filterJobs,
  };
};

const { addJobs } = useQueue({
  resolvers: {
    UPLOAD: (file: File) => console.log(file),
  } as const,
  onSuccess(data) {
    if(data.type === 'UPLOAD') {
      console.log(`File ${data.params.name} uploaded successfully.`)
    }
  },
  onError(data) {
    if(data.type === 'UPLOAD') {
      console.log(`File ${data.params.name} could not be uploaded.`)
    }
  }
});