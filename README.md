# Depansa++

> **This is not your everyday expense tracking app**, made by crazy dudes

> Still in development

- **BASE STACK**
  - expo
  - nativewind
  - nativewind reusable

## Development structure

- branches
  - **main** : release branch ( do not make changes in it )
  - **development** : development branch
  - **feature** :
    - template : feature/feature-name
    - the feature branch is to merged into the development and deleted after the
      feature is done

- flow :
  - main is the app branch
  - development is a checkout of main, development is done in it
    - code in development should be working code
    - **Radiant_wizard** is doing the merge of this branch into main
  - feature :
    - feature branches are branches created with development as origin
    - should be merged in development and deleted after the feature development
  - fix :
    - template : fix/fix-little-description
    - fix is a branch with main as its origin for it should be
      app fixes

  > [NOTE]
  > Remember to do a fetch and a pull to stay on the latest version
  > Don't commit too much
  > first launch of the app a little heavy, it is a TODO