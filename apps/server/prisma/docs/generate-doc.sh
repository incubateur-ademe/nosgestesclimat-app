#!/bin/bash

# Check if the environment variable SCALINGO_POSTGRESQL_URL is set
if [ -z "$SCALINGO_POSTGRESQL_URL" ]; then
    echo "Warning: SCALINGO_POSTGRESQL_URL environment variable is not set. Exiting."
    exit 0
fi

# Check if the environment variable POSTGRESQL_AUTODOC_TEMPLATES_PATH is set
if [ -z "$POSTGRESQL_AUTODOC_TEMPLATES_PATH" ]; then
    echo "Warning: POSTGRESQL_AUTODOC_TEMPLATES_PATH environment variable is not set (usually in /usr/share/postgresql-autodoc locally). Exiting."
    exit 0
fi

# Parse the connection string from MY_POSTGRE_URL environment variable
conn_string="$SCALINGO_POSTGRESQL_URL"

# Parse the connection string
regex="^postgres://([^:]+):([^@]+)@([^:]+):([^/]+)/(.*)\?sslmode=prefer$"
if [[ $conn_string =~ $regex ]]; then
    user="${BASH_REMATCH[1]}"
    password="${BASH_REMATCH[2]}"
    host="${BASH_REMATCH[3]}"
    port="${BASH_REMATCH[4]}"
    database="${BASH_REMATCH[5]}"
else
    echo "Invalid connection string format."
    exit 1
fi

mkdir -p dist/src/public
postgresql_autodoc -l "$POSTGRESQL_AUTODOC_TEMPLATES_PATH" -d "$database" -h "$host" -p "$port" -u "$user" -s ngc -f dist/src/public/database -t html --password="$password"
postgresql_autodoc -l "$POSTGRESQL_AUTODOC_TEMPLATES_PATH" -d "$database" -h "$host" -p "$port" -u "$user" -s ngc -f dist/src/public/database -t dot --password="$password"
dot -Tpng dist/src/public/database.dot -o dist/src/public/database.png
