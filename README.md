# ts-queue

Minimal typed queue implementation

## Usage

```typescript
const queue = new AsyncQueue<{
    OPEN: void,
    CLOSE: void,
    RESOLVE_IN: number,
}>({
    resolvers: {
        OPEN: () => {},
        CLOSE: () => {},
        RESOLVE_IN: (n) => new Promise(resolve => setTimeout(resolve, n * 1000)),
    }
})
```

### Resolvers
Resolvers are functions that are called asynchronously with the parameters defined in the queue.

### Adding jobs
You can add one or more jobs with `addJobs`.
```typescript
queue.addJobs({
  type: "OPEN",
});
queue.addJobs({
  type: "CLOSE",
});

```

### Conditional adding
You can add jobs based on the state of the queue with `addIf`. The function must pass a job and an iteratee that will receive the current state of the queue and return a boolean.

In this instance add a closing job if the last job is not of the same type.
```typescript
queue.addIf({type: 'CLOSE'}, (jobs) => {
    const lastJob = jobs[jobs.length];
    if(lastJob.type !== 'CLOSE') return true;
    return false;
})
```

### Remove jobs
You can only remove jobs that are not running.
Pass a filtering function and return a boolean to filter out jobs to remove.

In this example remove all jobs of the type `RESOLVE_IN`
```typescript
queue.filterJobs((job, index, jobs) => {
    if(job.type === 'RESOLVE_IN') return false;
    return true
})
```