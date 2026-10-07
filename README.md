# Immaculater-JS

Immaculater Protocol Buffer Node.js Module

This module will be used by a React app to store the state
for the Immaculater to-do list. This protocol is understood
by the [Django backend](https://github.com/chandler37/immaculater).

## Getting started on MacOS

1.  **Clone this repo and change directory.**

    ```sh
    # clone this repo
    git clone <this repo>
	# change directory
	cd immaculater-js
    ```

2. **If you are coming back to a clone you've used before, remove nodeenv virtual environment and npm installation directories**

    ```sh
    # nodeenv installs here:
    make clean
    ```

3.  **Install [Homebrew](https://brew.sh/)**

If you choose to use `nodeenv` below, you'll need Homebrew to provide a modern
Python interpreter.

Even if you don't, Homebrew is the best way to install Node.js, NPM, etc.

See [installation instructions](https://docs.brew.sh/Installation). If it's
already installed, consider `brew update; brew upgrade` to get the latest and
greatest versions of the packages you've installed.

4.  **OPTIONAL: Install [nodeenv](https://github.com/ekalinin/nodeenv).**

If you work on one project that requires Node version 12 and another that
requires Node version 10, nodeenv helps you stay sane. (Even if you have two
projects on the same Node version, you might need different versions of a
library or CLI tool.) Installing "globally" with `npm install -g`, when a
nodeenv environment `venv` is activated, is really a local install into the
`venv/` directory.

You might as well install nodeenv globally with the following:

    ```sh
    # install pip3 via homebrew; rehash so your bash shell can find the newly
    # installed pip3; globally install nodeenv
    brew update; brew install python; hash -r; sudo pip3 install nodeenv
    ```

nodeenv's website talks about `pip` but on MacOS that is Python 2.7 (either via
Homebrew `python@2` or, frigteningly, the stock Python provided by Apple), not
Python 3. `pip3` (using python version 3) is courtesy of the `python` package
from [Homebrew](https://brew.sh/).

Now that `nodeenv` is installed, run the following (but perhaps with a later
version of the LTS branch than 10.15.3 -- see the
[Node website](https://nodejs.org/en/) but note that Node 12 failed chandler37
on May 5 2019 during C++ compilation of the 'nan' package):

    ```sh
    # create virtual Node.js environment
    make venv
	. venv/bin/activate
    # Notice how your prompt says (venv) now.
    ```

5. **Install Node.js**

If you just used `nodeenv` then you're already done.

If not, use

    ```sh
    # install Node.js
	make installnodeenv
	```

See [this article](https://medium.com/@katopz/how-to-install-specific-nodejs-version-c6e1cec8aa11)
if you have trouble with versions.

6.  **Install dependencies.**

Navigate into the `immaculater-js/` directory and install dependencies.

    ```sh
    # install dependencies using npm
    make install
    ```

7.  **Start editing!**

    ```sh
    make test
    ```

The above command will watch files for changes. So change the files.


## Source Code and How to Commit

TODO(lgd): Need to add steps on how to create pull requests.


## Django Backend and mergeprotobufs

See https://github.com/chandler37/immaculater/pull/57 to learn about the
`mergeprotobufs` API that this module uses to read and write the to-do list.

If the API requires HTTP Basic authentication, provide
`IMMACULATER_API_USERNAME` and `IMMACULATER_API_PASSWORD` in the runtime
environment. Do not embed these values in client-side code or ship them in a
browser bundle.


## Credits

The first commit of this repository was based
on
[CleverBeagle's Npm-Package-Template](https://github.com/cleverbeagle/npm-package-template)

The `Makefile` and the first test case using the protocol buffer was courtesy
[chandler37](https://github.com/chandler37)
