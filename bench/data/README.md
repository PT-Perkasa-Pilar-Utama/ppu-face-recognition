

# Commands



## Accuracy benchmark

```sh
bun run bench/accuracy.bench.ts > bench/data/ts_accuracy.txt

# make sure you are in the venv

CUDA_VISIBLE_DEVICES=-1 uv run accuracy-default.bench.py > ../data/py_accuracy_default.txt

CUDA_VISIBLE_DEVICES=-1 uv run accuracy-custom.bench.py > ../data/py_accuracy_custom.txt

```


## Speed benchmark

```sh
bun run bench/speed.bench.ts > bench/data/ts_accuracy.txt

# make sure you are in the venv

uv run speed-custom.bench.py

uv run speed-default.bench.py

```