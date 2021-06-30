# Usage

```
$ docker run --rm -it -v /absolute/path/to/contract/project:/contract -e HASH=expectedHash gago55/secret-contract-verifier:version
```


Where 

`​​​​/absolute/path/to/contract/project`​ is pointing to the directory that contains your Secret Contract's ​​`​Cargo.toml`​​.

`​​​​expectedHash` is hash of Secret Contract's wasm file. You can find the hash of any contract on the following sites. [secret-contracts.com](https://secret-contracts.com) [secretnodes.com](https://secretnodes.com/secret/chains/secret-2/contracts)

`​​​​version` is version of builder ([secret-contract-optimizer](https://hub.docker.com/r/enigmampc/secret-contract-optimizer)).

This will output a text file `/absolute/path/to/contract/project/output.txt`, in the file will be the result - TRUE or FALSE.

# Dockerfiles

**1.0.0,1.0.1**

```
from enigmampc/secret-contract-optimizer:version

WORKDIR /contract

ENTRYPOINT ["/bin/bash", "-c", "echo 'Building contract...' && RUSTFLAGS='-C link-arg=-s' cargo build --release --target wasm32-unknown-unknown --locked && echo -e 'Building Done!\nComparing hashes...' && wasm-opt -Os ./target/wasm32-unknown-unknown/release/*.wasm -o ./contract.wasm && cargo clean && HASH=${HASH,,} && ACTUALHASH=$(sha256sum contract.wasm | cut -d \" \" -f 1 ) && if [ $HASH == $ACTUALHASH ] ; then echo -e \"TRUE\nExpected Hash = Actual Hash:$HASH\" > output.txt ; else echo -e \"FALSE\nExpected Hash:$HASH\nActual Hash:$ACTUALHASH\" > output.txt; fi && cat output.txt"]
```

**1.0.2 - 1.0.4**

```
from enigmampc/secret-contract-optimizer:version

WORKDIR /contract

ENTRYPOINT ["/bin/bash", "-c", "echo 'Building contract...' && RUSTFLAGS='-C link-arg=-s' cargo build --release --target wasm32-unknown-unknown --locked && echo -e 'Building Done!\nComparing hashes...' && wasm-opt -Oz ./target/wasm32-unknown-unknown/release/*.wasm -o ./contract.wasm && cargo clean && HASH=${HASH,,} && ACTUALHASH=$(sha256sum contract.wasm | cut -d \" \" -f 1 ) && if [ $HASH == $ACTUALHASH ] ; then echo -e \"TRUE\nExpected Hash = Actual Hash:$HASH\" > output.txt ; else echo -e \"FALSE\nExpected Hash:$HASH\nActual Hash:$ACTUALHASH\" > output.txt; fi && cat output.txt"]
```