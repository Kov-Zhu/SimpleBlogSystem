# Simple Blog System

N12086975 Kefu Zhu

## 1. Project Setup Instruction

This is a Simple Blog System in which you can create blogs and leave comments.

**To setup the project locally**:

1. Create `.env` file in `./backend` folder and filling them.

```sh
MONGO_URI=<MongoDB URL>
JWT_SECRET=<same as TaskManager project>
PORT=5001
```

2. Install all the dependence both for frontend and backend

Goto `./frontend` folder, run

```bash
npm install
```

Goto `./frontend` folder, run

```bash
npm install
```

3. If you want to run locally, goto `./frontend/axiosConfig.jsx` file, modify `baseURL`

```jsx
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5001', // local !!Use this one
  // baseURL: 'http://13.211.56.43:5001', // live
  headers: { 'Content-Type': 'application/json' },
});

export default axiosInstance;
```

4. use `npm test` to run a test to check if all dependece are install correctly
5. `npm run dev` to run this project. Goto `http://localhost:3000/blogs` (local)

**To setup remotely**:

If run remotely, the CI/CD will automatically build the whole project and run the server.

To build remote manually:

First, clone the Github repo to remote server (AWS instance).

```bash
git clone https://github.com/Kov-Zhu/SimpleBlogSystem.git
```

Seceond, build the project.

 * Backend:
   1. Install all the dependence. Goto `./backend` run `npm install`
   2. Use pm2 to run the backend server `pm2 start "npm run start" --name "backend"`
 * Frontend:
   1. Install all the dependence. Goto `./frontend` run `npm install`
   2. Build the react project `npm run build`
   3. Use pm2 to run the frontend server `pm2 serve build/ 3000 --name "Frontend" --spa`
 * After that, run `pm2 status` to check if everything works properly.



## 2. CI/CD Pipline Details

```yml
name: CI

on:
    push:
        branches:
            - main
    pull_request:
        branches:
            - main
```

It **triggers** when:

* A **push** is made to the `main` branch.
* A **pull request** is opened against the `main` branch.

```yml
jobs:
    test:
        name: Run Tests
        runs-on: self-hosted
```

A job named "Run Tests" is defined.

It runs on a self-hosted runner, meaning it's not executed on GitHub's servers but on a custom server.

```yml
        strategy:
            matrix:
                node-version: [22] # Test on Node.js versions == 22
```

**Matrix strategy** allows testing on multiple Node.js versions.

Here, it's set to test **only Node.js v22**.

```yml
        environment: MONGO_URI
```

* Specifies that the `MONGO_URI` secret (MongoDB connection string) is needed for this job.

```yml
        steps:
        -   name: Checkout Code
            uses: actions/checkout@v3
```

* Uses `actions/checkout@v3` to fetch the repository code into the runner.

```yml
        -   name: Set up Node.js
            uses: actions/setup-node@v3
            with:
                node-version: ${{ matrix.node-version }}

```

* Uses `actions/setup-node@v3` to **install Node.js v22** (from the matrix configuration).

```yml
        -   name: Cache npm dependencies
            uses: actions/cache@v3
            with:
                path: ~/.npm
                key: ${{ runner.os }}-npm-${{ hashFiles('package-lock.json') }}
                restore-keys: |
                            ${{ runner.os }}-npm-
```

* Uses `actions/cache@v3` to **cache npm dependencies** to speed up future installs.
* It caches `~/.npm` based on the hash of `package-lock.json`.
* If an exact match isn’t found, it restores a previously cached version.

```yml
        -   name: Print Env Secret

            env:
                MONGO_URI: ${{ secrets.MONGO_URI }}
                JWT_SECRET: ${{ secrets.JWT_SECRET }}
                PORT: ${{ secrets.PORT }}
            run: | 
                echo "Secret 1 is: $MONGO_URI"
                echo "Secret 2 is: $JWT_SECRET"
                echo "Secret 3 is: $PORT"
```

* Retrieves **secrets** (`MONGO_URI`, `JWT_SECRET`, `PORT`) from GitHub's secret storage.

```yml
         -   run: pm2 stop all
```

* Stops all currently running **PM2-managed** Node.js processes. This is becuase we will setup and rebuild the project later.

```yml
        # Install dependencies for backend
        -   name: Install Backend Dependencies
            working-directory: ./backend
            run: |
                node --version
                npm install -g yarn
                yarn install

        # Install dependencies for frontend
        -   name: Install Frontend Dependencies
            working-directory: ./frontend
            run: |
                df -h
                sudo rm -rf ./build
                yarn install
                yarn run build
```

* Use `yarn` to install all the dependence for backand and frontend
* `yarn build` to build the frontend `react` project

```yml
        # Run backend tests
        -   name: Run Backend Tests
            env:
                MONGO_URI: ${{ secrets.MONGO_URI }}
                JWT_SECRET: ${{ secrets.JWT_SECRET }}
                PORT: ${{ secrets.PORT }}
            working-directory: ./backend
            run: npm test
```

* run backend test defined in `./backend/test/blog.test.js`

```yml
        -   run: npm ci
        -   run: | 
                cd ./backend
                touch .env
                echo "${{ secrets.PROD }}" > .env
```

* Moves to `./backend`.

* Creates a `.env` file with production secrets.

```yml
        -   run: |
                pm2 list
                pm2 start all

        -   run: pm2 restart all
```

* Lists all PM2 processes (`pm2 list`).

* Starts all PM2-managed applications (`pm2 start all`).
