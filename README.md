# hyperfine-action

[![Build Status](https://github.com/blacha/cogeotiff/workflows/Main/badge.svg)](https://github.com/blacha/cogeotiff/actions)


Runs [Hyperfine](https://github.com/sharkdp/hyperfine) as a github action


# Usage

Create a `.hyperfine.js`

```javascript
module.exports = [{
    name: 'Sleep 100ms',
    command: 'sleep 0.1'
}, {
    name: 'Test index',
    command: 'node index.js'
}]
```

Add the action to your github action
```yaml
    - uses: blacha/hyperfine-action@releases/v1
```

output

```
Run blacha/hyperfine-action@releases/v1
Starting benchmark Sleep 100ms
Benchmark #1: sleep 0.1
  Time (mean ± σ):     101.2 ms ±   0.1 ms    [User: 1.0 ms, System: 0.3 ms]
  Range (min … max):   101.0 ms … 101.4 ms    29 runs


Starting benchmark Test index
Benchmark #1: node index.js
  Time (mean ± σ):      5.039 s ±  0.002 s    [User: 28.8 ms, System: 6.7 ms]
  Range (min … max):    5.035 s …  5.043 s    10 runs
```


Example Repo [Actions](https://github.com/blacha/hyperfine-action-test/actions)


## Future
In the future the `benchmarks.json` could be parsed and pushed to github pages to create a dynamic benchmark generation
