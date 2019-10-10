# hyperfine
[![Build Status](https://travis-ci.org/sharkdp/hyperfine.svg?branch=master)](https://travis-ci.org/sharkdp/hyperfine)
[![Build status](https://ci.appveyor.com/api/projects/status/pdqq5frgkcj0smrs?svg=true)](https://ci.appveyor.com/project/sharkdp/hyperfine)
[![Version info](https://img.shields.io/crates/v/hyperfine.svg)](https://crates.io/crates/hyperfine)
[中文](https://github.com/chinanf-boy/hyperfine-zh)

A command-line benchmarking tool.

**Demo**: Benchmarking [`fd`](https://github.com/sharkdp/fd) and
[`find`](https://www.gnu.org/software/findutils/):

![hyperfine](https://i.imgur.com/5OqrGWe.gif)

## Features

* Statistical analysis across multiple runs.
* Support for arbitrary shell commands.
* Constant feedback about the benchmark progress and current estimates.
* Warmup runs can be executed before the actual benchmark.
* Cache-clearing commands can be set up before each timing run.
* Statistical outlier detection to detect interference from other programs and caching effects.
* Export results to various formats: CSV, JSON, Markdown, AsciiDoc.
* Parameterized benchmarks (e.g. vary the number of threads).
* Cross-platform

## Usage

### Basic benchmark

To run a benchmark, you can simply call `hyperfine <command>...`. The argument(s) can be any
shell command. For example:
``` bash
hyperfine 'sleep 0.3'
```

Hyperfine will automatically determine the number of runs to perform for each command. By default,
it will perform *at least* 10 benchmarking runs. To change this, you can use the `-m`/`--min-runs`
option:
``` bash
hyperfine --min-runs 5 'sleep 0.2' 'sleep 3.2'
```

### I/O-heavy programs

If the program execution time is limited by disk I/O, the benchmarking results can be heavily
influenced by disk caches and whether they are cold or warm.

If you want to run the benchmark on a warm cache, you can use the `-w`/`--warmup` option to perform
a certain number of program executions before the actual benchmark:
``` bash
hyperfine --warmup 3 'grep -R TODO *'
```

Conversely, if you want to run the benchmark for a cold cache, you can use the `-p`/`--prepare`
option to run a special command before *each* timing run. For example, to clear harddisk caches
on Linux, you can run
``` bash
sync; echo 3 | sudo tee /proc/sys/vm/drop_caches
```
To use this specific command with Hyperfine, call `sudo -v` to temporarily gain sudo permissions
and then call:
``` bash
hyperfine --prepare 'sync; echo 3 | sudo tee /proc/sys/vm/drop_caches' 'grep -R TODO *'
```

### Parameterized benchmarks

If you want to run a benchmark where only a single parameter is varied (say, the number of
threads), you can use the `-P`/`--parameter-scan` option and call:
``` bash
hyperfine --prepare 'make clean' --parameter-scan num_threads 1 12 'make -j {num_threads}'
```
This also works with decimal numbers. The `-D`/`--parameter-step-size` option can be used
to control the step size:
``` bash
hyperfine --parameter-scan delay 0.3 0.7 -D 0.2 'sleep {delay}'
```
This runs `sleep 0.3`, `sleep 0.5` and `sleep 0.7`.

### Export results

Hyperfine has multiple options for exporting benchmark results: CSV, JSON, Markdown (see `--help`
text for details). To export results to Markdown, for example, you can use the `--export-markdown`
option that will create tables like this:

| Command | Mean [s] | Min [s] | Max [s] | Relative |
|:---|---:|---:|---:|---:|
| `find . -iregex '.*[0-9]\.jpg$'` | 2.395 ± 0.033 | 2.355 | 2.470 | 7.7 |
| `find . -iname '*[0-9].jpg'` | 1.416 ± 0.029 | 1.389 | 1.494 | 4.6 |
| `fd -HI '.*[0-9]\.jpg$'` | 0.309 ± 0.005 | 0.305 | 0.320 | 1.0 |

The JSON output is useful if you want to analyze the benchmark results in more detail. See the
[`scripts/`](https://github.com/sharkdp/hyperfine/tree/master/scripts) folder for some examples.

## Installation

### On Ubuntu

Download the appropriate `.deb` package from the [Release page](https://github.com/sharkdp/hyperfine/releases)
and install it via `dpkg`:
```
wget https://github.com/sharkdp/hyperfine/releases/download/v1.7.0/hyperfine_1.7.0_amd64.deb
sudo dpkg -i hyperfine_1.7.0_amd64.deb
```

### On Fedora

On Fedora, hyperfine can be installed from the official repositories:

```sh
dnf install hyperfine
```

### On Alpine Linux

On Alpine Linux, hyperfine can be installed [from the official repositories](https://pkgs.alpinelinux.org/packages?name=hyperfine):
```
apk add hyperfine
```

### On Arch Linux

On Arch Linux, hyperfine can be installed [from the official repositories](https://www.archlinux.org/packages/community/x86_64/hyperfine/):
```
pacman -S hyperfine
```

### On Void Linux

Hyperfine can be installed via xbps

```
xbps-install -S hyperfine
```

### On macOS

Hyperfine can be installed via [Homebrew](https://brew.sh):
```
brew install hyperfine
```

### On FreeBSD

Hyperfine can be installed via pkg:
```
pkg install hyperfine
```

### With conda

Hyperfine can be installed via [`conda`](https://conda.io/en/latest/) from the [`conda-forge`](https://anaconda.org/conda-forge/hyperfine) channel:
```
conda install -c conda-forge hyperfine
```

### With cargo (Linux, macOS, Windows)

Hyperfine can be installed via [cargo](https://doc.rust-lang.org/cargo/):
```
cargo install hyperfine
```

Make sure that you use Rust 1.32 or higher.

### From binaries (Linux, macOS, Windows)

Download the corresponding archive from the [Release page](https://github.com/sharkdp/hyperfine/releases).

## Alternative tools

 Hyperfine is inspired by [bench](https://github.com/Gabriel439/bench).

## Origin of the name

The name *hyperfine* was chosen in reference to the hyperfine levels of caesium 133 which play a crucial role in the
[definition of our base unit of time](https://en.wikipedia.org/wiki/Second#History_of_definition)
— the second.
