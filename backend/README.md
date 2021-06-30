# Secret Contract Verifier
This document covers usage info on how to run Secret Contract Verifier on your own servers.

## How to setup back-end

### Required packages for your server machine

- _zip_ - to zip files
- _unzip_ - to unzip files
- _docker_ - to build and verify contracts

If you want to save verified source also on Github, you will need

- _gh_ - to create repo on Github
- _git_ - to commit and push source to Github

#### Installation commands for packages

```
sudo apt-get install zip
sudo apt-get install unzip
sudo apt-get install git
```
- [docker installation instruction](https://docs.docker.com/engine/install/#server)
- [gh installation instruction](https://github.com/cli/cli/blob/trunk/docs/install_linux.md#official-sources)



### Steps

1. Fork this repo!
2. Create `.env` file in the root directory of backend
3. Set values in `.env` file
```
MONGODB_URL=connection string
DATAHUB_API_URL=https://secret-2--lcd--full.datahub.figment.io/apikey/yurApiKey/
PORT=portNumber
SAVE_TO_GITHUB=false
```
4. To fetch data about `Codes` and `Contracts` run the following command
```
node pathToProject/src/updateData.js
```
* Command will execute `updateData.js`, which will fetch data from the blockchain using [Figment's Datahub API](https://datahub.figment.io).
* If you run the command again, it will check if there are new `Codes` in blockchain, and fetch if there are. 

5. Optionally, you can add `cron job` to execute the command of the 4th point repetitively. To add `cron job` run the following command.

```
crontab -e
```
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Add line bellow in opened file and save it. Command of 4th point will be executed hourly.
```
 00 * * * * echo $(date) >> /pathToLogFolder/updateData.log 2>&1 && cd /pathToProject && node src/updateData.js >> /pathToLogFolder/updateData.lo/updateData.log 2>&1
```
6. If you want to save verified sources also on Github, you will need to [configure](https://git-scm.com/book/en/v2/Customizing-Git-Git-Configuration) `git` on your machine, and [login](https://cli.github.com/manual/gh_auth_login) with `gh`. 

7. Run application
```
node /pathToProject/src/index.js
```

## 🟥 Attention 🟥

Make sure
- `docker` demon is running on your machine, before running app, otherwise app won't be able to verify `Codes`
- your linux user have not password, otherwise app will not be able to execute some commands, because they need prefix `sudo`
- you run app without option `watch`, otherwise app will be restarted in verification process, because app is creating/deleting some files in verification process

## How to setup front-end

[Instruction](https://github.com/Gago55/Secret-Contract-Verifier/blob/master/README.md)