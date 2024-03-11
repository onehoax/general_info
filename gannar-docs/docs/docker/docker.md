# [Mongo Docker](./mongo.md)

# Docker on Windows

The user has to be part of the docker group so they can use the Docker daemon without needing admin privileges.

## Use `net localgroup` command in `cmd`

Ref: [article](<https://en.wikiversity.org/wiki/Net_(command)/Localgroup#Remove_a_User_from_a_Local_Group>)

- Open `cmd` as administrator
- List local groups
  - `net localgroup`
- List users in a local group
  - `net localgroup <groupname>`
  - e.g.: `net localgroup docker-users`
- List users
  - `net user`
- Add a user to a local group
  - `net localgroup <groupname> <username> /add`
  - e.g.: `net localgroup docker-users Bob /add`
- Remove a user from a local group
  - `net localgroup <groupname> <username> /delete`
  - e.g.: `net localgroup docker-users Bob /delete`

## GUI for user/group management (has limitations)

Ref: [article](https://answers.microsoft.com/en-us/windows/forum/all/local-users-and-grops-is-missing-in-computer/eb8bb20a-510d-40c8-b325-981c80f24ece)
