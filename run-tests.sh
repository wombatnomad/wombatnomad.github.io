#!/bin/bash

# Run all tests

failcnt=0
for testfile in tests/*.js; do
    echo -e -n "\x1B[1m"`basename $testfile`"... \x1B[0m"
    if node $testfile; then
        echo -e "\x1B[32mPASS\x1B[0m"
    else
        failcnt=$(($failcnt + 1))
        echo -e "\x1B[31mFAIL\x1B[0m"
    fi
done

if [ $failcnt -eq 0 ]; then
    echo -e "\x1B[32mALL TESTS PASS\x1B[0m"
else
    echo -e "\x1B[31m$failcnt TESTS FAILED\x1B[0m"
    exit 1
fi
