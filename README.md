
#### Setup

1. git clone https://github.com/niluke/celestia_cli_tool.git
2. npm i 
3. cd /usr/local/bin     
4. sudo vim celestia.sh


```bash
#!/bin/bash
node /home/username/celestia_cli_tool/main.js "$@"
```
5. :wq
6. chmod +x  celestia.sh
7. celestia generate-mnemonic
8. create  .env just like  in the .env.example  

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