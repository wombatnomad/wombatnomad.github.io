#!/bin/bash

# Run all tests

set -e

for testfile in tests/*.js; do
    node $testfile && echo `basename $testfile` PASSED
done
