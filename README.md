
#### Setup

git clone ``
npm i 
cd /usr/local/bin     
sudo vim celestia.sh

```bash
#!/bin/bash
node /home/username/reponame/main.js "$@"
```
:wq
chmod +x  celestia.sh
celestia generate-mnemonic
create  .env just like  in the .env.example  

---

#### usage 

```bash celestia                                                                                                                                   ─╯
celestia <command>

Commands:
  celestia transfer           Send a transaction to a specified address
  celestia balance            Check the wallet balance
  celestia address            Check the wallet address
  celestia ibc-transfer       Send an ibc-transaction to a specified address
  celestia generate-mnemonic  Generate a new wallet mnemonic

Options:
      --version  Show version number                                   [boolean]
  -h, --help     Show help                                             [boolean]

  ```