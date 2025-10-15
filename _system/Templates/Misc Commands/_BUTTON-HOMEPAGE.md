```meta-bind-button
label: 👋 Hello. Click this button to create your vault author profile
icon: ""
style: destructive
actions:
  - type: templaterCreateNote
    templateFile: _system/Templates/_Primary/+vaultAuthor.md
    folderPath: /
    fileName: ""
    openNote: false
    openIfAlreadyExists: false
  - type: replaceSelf
    replacement: |
```
