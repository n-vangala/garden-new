# Garden Take Home Assignment Specification

Welcome to the Garden take home assignment. Your goal is to build a full stack web app that aligns with the specification outlined below. To help accelerate the initial setup, we have provided you with scaffolding code that uses a similar stack to our production codebase. You may overwrite or refactor this scaffolding code as much as you would like, but keep in mind that demonstrating familiarity with the technologies that make up our production stack will be considered as a minor factor in the scoring criteria.

To successfully complete this assignment, you must fulfill the minimum requirements within the alloted time. If you finish with time remaining, then continue onto the additional features -- the more additional features you implement the higher you will score. You may also come up with your own additional features instead of choosing from the given list, as long as you include an explanation in your writeup.

Two mock microservices have been provided. One is for image OCR, and the other is for text embedding. Providing access to real OCR and text embedding models would be expensive, so these services generate mock outputs. As a result, you may not change the code in the `packages/embed` or `packages/ocr` directories without approval.

## Setup

You have been provided access to this template repository via Github Classroom, as well as ssh access to a VM running on Google Cloud. Clone this repo onto that VM. You will have sudo access to the VM, and are free to do as you please with installations, configurations, etc. To help speed up the initial setup, the VM will already have NodeJS and MongoDB installed/configured. You do not have to use MongoDB, but it is strongly recommended and will be a minor factor in your score.

You should add a `.env` file at the repository root (`/takehome/.env`) with a single environment variable `VM_IP_ADDRESS` that you should set to the public IP address of the provided VM.

If you are running the server and the client on your local machine, you should start them using `npm run dev:local`. If you are running the server and the client on the remote VM, you should start them using `npm run dev:remote`.

## Submission

Your final submission will be the code pushed to the Github Classroom remote as of the deadline. You may also submit a writeup if you would like. Please put your writeup in the `WRITEUP.md` file and push it to the Github Classroom remote within 24 hours after the deadline.

## Scoring

Your final score will be a holistic assessment of the quality of your assignment across a variety of factors. The more features you complete, the higher you will score. The more you can demonstrate your understanding of the fundamentals of web development, the higher you will score. The overall stability and polish of your app will be taken into account. The overall code quality will be taken into account. Demonstrating familiarity with the technologies that make up our stack will be viewed favorably.

## Philosophy

The genesis for this assignment is our need as a company to collect company and product information from the web to compare against patents/patent portfolios. We need to be able to collect various types of source documents (html, pdf, mp4, etc), postprocess/enrich them to ensure maximum efficiency during patent analysis, and group them into collections of documents that have a shared context (all documents from one company, or all documents that apply to a particular product line, etc).

## Minimum Requirements

-   Users must be able to initiate a processing job for a URL of their choosing, and multiple URLs must be able to be processed simultaneously.
-   Users must be able to view information on the status of ongoing or completed jobs. For ongoing jobs, you must use an approach where the server pushes updates to the client -- polling will be penalized. The more granular the status updates the better.
-   The following rules will define the requirements for the processing pipeline. These requirements are different depending on the type of document located at the given URL
    -   HTML document: Get the document, extract the text nodes, optionally clean the text, chunk and embed (fake) the text. On the frontend, the user must be able to see the full html document, the extracted text, and then each chunk and its corresponding embedding vector.
    -   PDF document: Get the document, convert to images, OCR the images (fake), chunk (handle the text from each page separately) and embed (fake) the text. On the frontend, the user must be able to see the page images, and for each page should be able to see the extracted text, and then each chunk and its corresponding embedding vector.

## Additional Features

-   Document Groups
    -   Add named document groups, such that any given document can belong to multiple groups (for example a company group and a product line group).
    -   Add group relationships, such that groups can have parents and children. (e.g. a document that belongs to a child group should also belong to the parent group)
    -   Allow the user to easily curate the group(s) that documents belong to
    -   Allow the user to search, sort, and filter the documents by type, group(s), etc
-   Add hydration to HTML documents -- many HTML documents are blank until hydrated by javascript code (for example in React websites).
-   Extract additional metadata from HTML documents, such as the page title, and use it in the UI
-   Display thumbnails for HTML documents
-   Display thumbnails for PDF documents
-   Add a PDF viewer to the frontend.
-   Implement a crawling feature, such that instead of providing a list of urls the user can provide a single starting url and a set of inclusion/exclusion regexes, and the crawler will crawl the web starting from the given url, applying the inclusion/exclusion regexes to determine whether to crawl a given url.
-   Add https support (on the remote VM) so that I can type `https://{your_vm_ip}:3001/` into my browser and securely access your app.

## Notes

-   If you need some direction regarding UI design, the `ui-inspiration` directory contains some screenshots of the Garden production app that you can use as inspiration.
-   For file storage (e.g. pdf documents, images) you can either use the VM's file system or the mongodb database (just remember that mongodb has a document size limit of 16MB, so you will need to use GridFS)
-   Some technologies that we use as part of our production stack are as follows:
    -   Frontend: typescript, react, zustand, react/tanstack query, tanstack router, tailwindcss, vite
    -   Backend: nodejs, expressjs, mongodb
