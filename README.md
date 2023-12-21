# ts-queue

Minimal typed queue implementation

## Usage

```typescript
const { addJobs, addIf, filterJobs } = useQueue({
  resolvers: {
    UPLOAD: (file: File) => console.log(file),
  },
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
```

### Resolvers
Resolvers are functions that are called asynchronously with the parameters defined in the queue. All typing of the queue is inferred by the definitions given here.

```typescript
const resolvers = {
  UPLOAD: (file: File) => console.log(file),
}
```

### Adding jobs
You can add one or more jobs with `addJobs`.
```typescript
addJobs({
  type: 'UPLOAD', params: file
})

```

### Conditional adding
You can add jobs based on the state of the queue with `addIf`. The function must pass a job and an iteratee that will receive the current state of the queue and return a boolean.

In this instance will discard the job if too many are queued
```typescript
addIf({
  type: "UPLOAD",
  params: file,
}, ( jobs ) => {
  if(jobs.length > 20) {
    console.log('There are too many queued jobs. Discarding')
    return false;
  }
  return true;
});
```

### Remove jobs
You can only remove jobs that are not running.
Pass a filtering function and return a boolean to filter out jobs to remove.

In this example remove all queued jobs whose files are too big.
```typescript
filterJobs((jobs) => {
  if (jobs.params.size > 1024 * 20) {
    return false;
  }
  return true;
});
```

### Reacting to status
There are three typed functions that you can use to react to events happening in the queue. `onSuccess`, `onError`, and `onCleared`.
Upon success the function is called with the type and parameters and the result of the job.
Upon error the same happens but rather than the result you have the error that was thrown.
Upon clearing of the queue the function is called.
If the queue clears multiple times the function is run multiple times.

:warning: **Remember promises are not web workers**: CPU intensive tasks will still block the main thread.