
# Endoplexus

A multiplayer browser game about miniaturization, digital logic, and resource management

## Requirements

This application has the following system-wide dependencies:

* Node.js version ^22.14
* pnpm version ^10.6
* TypeScript ^5.8

## Installation and Usage

To set up and run this application:

1. Clone this repository: `git clone https://github.com/ostracod/endoplexus`
1. Enter the repository directory: `cd ./endoplexus`
1. Install JavaScript dependencies: `pnpm install`
1. Compile TypeScript code: `tsc`
1. Create an environment variables file from the example file: `cp ./.env.example ./.env`
1. Adjust the content of `./.env` as necessary.
1. Copy your `ssl.key`, `ssl.crt`, and `ssl.ca-bundle` files into the `endoplexus` repository directory.
1. Run the application: `node ./dist/endoplexus.js`

## Environment Variables

This application recognizes the following environment variables:

* `NODE_ENV` = `production` to run in production mode, or `development` to run in development mode
    * In development mode, the application runs without SSL files, and authentication can be bypassed
* `SESSION_SECRET` = Private string to compute session hash
* `PORT_NUMBER` = Port number on which to run the server


