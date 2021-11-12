- [Submission Guidelines](#submission-guidelines)
  - [Submitting an Issue](#submitting-an-issue)
  - [Submitting a Pull Request](#submitting-a-pull-request)
- [Commit Message Guidelines](#commit-message-guidelines)
  - [Type](#type)
  - [Scope](#scope)

## Submission Guidelines

Before you submit an issue or PR, please search the existing one to avoid duplicate.

Don't restrict your search to only **open** issues. An issue with a title similar to yours may have been closed as a duplicate of one with a less-findable title.

### Submitting an Issue

Support bug report and feature request when you submitting an new issue.

### Submitting a Pull Request

It's recommend to submit an issue before you submit PR.

Consider the following guidelines:

- Submit an issue that describe what your PR does.
- Make your changes in a new git branch:

  ```shell
  git checkout -b issue-N/A main
  ```

- Create your patch, **including appropriate test cases**.
- Ensure that all tests pass.
- Commit your changes using a descriptive commit message that follows our [Commit Message Guidelines](#commit-message-guidelines). Adherence to these conventions is necessary because release notes are automatically generated from these messages.

  ```shell
  git commit -a
  ```

  Note: the optional commit `-a` command line option will automatically "add" and "rm" edited files.

- Push your branch to GitHub:

  ```shell
  git push origin issue-N/A
  ```

- In GitHub, send a pull request to `react-devui:main`.
- If you need some changes then:

  ```shell
  git rebase main -i
  git push -f origin issue-N/A
  ```

## Commit Message Guidelines

We use [commitlint](https://github.com/conventional-changelog/commitlint) to check commit message.

Before you read next content, make sure know about [conventional commit format](https://www.conventionalcommits.org/en).

### Type

Must be one of the following:

- **feat**: A new feature.
- **fix**: A bug fix.
- **chore**: Does not belong to any one other type.
- **docs**: Documentation only changes.
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc).
- **refactor**: A code change that neither fixes a bug nor adds a feature.
- **perf**: A code change that improves performance.
- **test**: Adding missing tests or correcting existing tests.

### Scope

Must be one of the following:

- **empty**: Does not provide scope
- **module**: Such as **site**
- **module:\***: Such as **ui:button**

Real world examples can look like this:

```shell
chore: update dependencies
feat(site): support themes
fix(ui:button): fix `onClick` no response
```
