from enigmampc/secret-contract-optimizer:1.0.2

WORKDIR /contract

ENTRYPOINT ["/bin/bash", "-c", "echo 'Building contract...' && RUSTFLAGS='-C link-arg=-s' cargo build --release --target wasm32-unknown-unknown --locked && echo -e 'Building Done!\nComparing hashes...' && wasm-opt -Oz ./target/wasm32-unknown-unknown/release/*.wasm -o ./contract.wasm && cargo clean && HASH=${HASH,,} && ACTUALHASH=$(sha256sum contract.wasm | cut -d \" \" -f 1 ) && if [ $HASH == $ACTUALHASH ] ; then echo -e \"TRUE\nExpected Hash = Actual Hash:$HASH\" > output.txt ; else echo -e \"FALSE\nExpected Hash:$HASH\nActual Hash:$ACTUALHASH\" > output.txt; fi && cat output.txt"]