---
title: "Deploy Your Hugo Static Website to Netlify Using Github Actions"
date: 2021-02-24T20:56:31+01:00
author: Dika
tags: [ci/cd, github, github actions]
---

So you just built your Hugo static website and pondering how to handle deployments. The Hugo docs have a [Hosting and Deployment](https://gohugo.io/hosting-and-deployment/) section for various providers that you can deploy to. But this post is focused on deploying to [Netlify](https://www.netlify.com/) using [Github Actions](https://docs.github.com/en/actions). We will use Github Actions for the CI/CD pipeline and Netlify as the deployment platform. This will be a manual Netlify deployment using its CLI from the CI/CD pipeline.

## Steps

* Setup a repository on Github.

* Setup a Netlify account (If you don't have one already).

* Add a new `Site` on Netlify and connect it to your repository.

* Update/Change site name if you don't like the one assigned by Netlify.

* Configure your settings and build your site. The build might fail if you have not pushed your code to Github.
But the build status is not of concern now because we want to do manual deploys from Github instead of Netlify triggering builds when we push to Github:
  * Build command: `hugo --gc --minify`
  * Publish directory: `public`

* Get your site `API ID` from the Site settings > General > Site details.

* Obtain a Personal access token from Netlify: https://docs.netlify.com/cli/get-started/#obtain-a-token-in-the-netlify-ui

* Add two secrets to your Github repository: https://docs.github.com/en/actions/reference/encrypted-secrets#creating-encrypted-secrets-for-a-repository

    ```sh
    NETLIFY_SITE_ID: ${Netlify site API ID from the above}
    NETLIFY_AUTH_TOKEN: ${Netlify Personal access token}
    ```

* Create the `.github/workflows` directory at the root of your project.

* Create the workflow YAML file(you can name it as you please) in the `.github/workflows` directory.
    Now your directory tree should look something like this:

    ```sh
    ├── .github
    │   └── workflows
    │       └── ci-cd.yml
    ...
    ```

* Copy and paste this into the workflow file you just created. Check below for an explanation of the workflow file.

  {{< highlight yaml "linenos=table,linenostart=1" >}}
name: CI/CD

on:
[push]

jobs:
build:
  name: Build static artifacts using Hugo
  runs-on: ubuntu-18.04
  steps:
    - uses: actions/checkout@v2
      with:
        submodules: true  # Fetch Hugo themes (true OR recursive)
        fetch-depth: 50
    - name: Setup Hugo
      uses: peaceiris/actions-hugo@v2
      with:
        hugo-version: '0.80.0'
    - name: Build
      run: hugo --gc --minify
    - name: Upload public directory # Upload /public artifact if on `main` branch
      uses: actions/upload-artifact@v2
      if: github.ref == 'refs/heads/main'
      with:
        name: public
        path: public/
      retention-days: 1

deploy:
  name: Deploy to Netlify
  needs: build
  runs-on:  ubuntu-18.04
  steps:
    - name: Download public directory
      uses: actions/download-artifact@v2
      with:
        name: public
        path: public/
    - name: Publish
      uses: netlify/actions/cli@master
      with:
        args: deploy -p --dir=public
      env:
        NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
        NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
  {{</ highlight >}}

* Commit this workflow file and push to Github. This should trigger the workflow.
To see the running workflow details, click on the `Actions` tab from the repository page.
Click on the commit message from the `Actions` page to see the jobs in the workflow.
Check that the `Deploy to Netlify` job was completed successfully.
If it did, the `Publish` step will have an output similar to this:

  {{< highlight shell "linenos=table,linenostart=1">}}
- Hashing files...
✔ Finished hashing 36 files
- CDN diffing files...
✔ CDN requesting 10 files
- Uploading 10 files
✔ Finished uploading 10 assets
- Waiting for deploy to go live...
✔ Deploy is live!
Deploy path: /github/workspace/public
Deploying to main site URL...

Logs:              https://app.netlify.com/sites/dikaeinstein/deploys/603446fa5903cf26acab7fea
Unique Deploy URL: https://603446fa5903cf26acab7fea--dikaeinstein.netlify.app
Website URL:       https://dikaeinstein.dev
  {{</ highlight >}}

  Now follow the link to check out your newly deployed website.

## The Github Actions Workflow File

Starting from the top of the file. The workflow is named using the `name` field,
it is triggered by the `push` event on the repository, which will kickoff the jobs that run serially.

* First the `build` job runs which primarily builds the project using `hugo --gc --minify` and
outputs artifacts(HTML, CSS, JS) which are saved in the /public directory. It relies on the `peaceiris/actions-hugo@v2` Github action.
Then it uploads the artifacts so they can be used in the `deploy` job without re-building again.

* The `deploy` job downloads the artifact and publishes the content of the `/public` directory to Netlify.

    **Note**: The `needs: build` field on the `deploy` job, specifies that the `build` job must complete before the `deploy` job can proceed.
    This is why both jobs did not run in parallel.

For more details, check out the [Github Actions Workflow Reference](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)

## Conclusion

We just set up an automated pipeline that will deploy changes on the main branch of your repository to Netlify.
I prefer this mode of deployment because it gives you control over how you want to deploy to Netlify and the workflow YAML file
also serves as documentation of the CI/CD pipeline which is also managed with version control.
