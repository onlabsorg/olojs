
# olojs command-line interface

### olojs init [template] [options...]
Initializes a repository in the current directory.

When called without the `[template]` and `[options...]` parameter, it
creates a `olonv.js` file and a `docrs` directory in the current directory.
The `olonv.js` file is a javascript module that exports an 
[olojs environment](./api/environment.md), while the `docrs` directory is
the place where the documents are stored.

You can customize the repository environment by modifying the `olonv.js` file.

When called with the `[template]` and `[options...]` parameter, it will delegate
the repository creation to `require(template).init()`.

### olojs render <path> [args...]
Renders the document `./docrs/<path>` and prints it to the console.
If you provide arguments (e.g. arg1=10, arg2=20, ...), they will be accessible
to inline expression as items of the `argns` namespace.

### olojs serve [port]
Serve the current repository via HTTP.
Once the server is running, you can render the repository documents in the
browser by typing their path (relative to ./docrs) as hash.

### olojs -h
Displays help for the cli

### olojs -v
Outputs the olojs cli version
