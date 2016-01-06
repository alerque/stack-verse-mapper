#!/usr/bin/env bash

function flunk() {
    echo $@
    exit 1
}

# Check to see if we can find the dump file for the site name given
case $1 in
    [a-z]*)
        archive_url="https://archive.org/download/stackexchange/$1.7z"
        dump_url=$(curl -w "%{url_effective}" -I -L -s -S $archive_url -o /dev/null)
        curl -o /dev/null -s --fail --head $dump_url ||
            flunk "Dump file for site ${1} not found"
        site=$1
        ;;
    *)
        flunk "Not a valid site name"
        exit
        ;;
esac

# Download and exctract the data dump
dump="${site}.7z"
curl -o "$dump" -C - --progress $dump_url
rm -rf data_dump
mkdir data_dump
cd data_dump
7z e "../$dump"
