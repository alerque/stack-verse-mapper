#!/usr/bin/env bash
set -e

function flunk() {
    echo $@
    exit 1
}

# Check to see if we can find the dump file for the site name given
case $1 in
    [a-z]*)
        archive_url="https://archive.org/download/stackexchange/${1}.7z"
        dump_url=$(curl -w "%{url_effective}" -I -L -s -S $archive_url -o /dev/null)
        curl -o /dev/null -s -f -I $dump_url || flunk "Dump file for site ${1} not found"
        ;;
    *)
        flunk "Not a valid site: ${1}"
        exit
        ;;
esac

curl -o "data/${1}.7z" -C - -# $dump_url
