# Contributing to Haretna

thanks for being interested in helping out with Haretna.

i know that this project is still very much in the “show the idea clearly” stage. that means a lot of the value in contributing comes from making the concept easier to understand, easier to use, and easier to build on
however, if youre here to improve the frontend, tighten up the backend, or just make the docs clearer, your help is welcome.

## Ways to contribute

You can help in a few different ways:

- improve the user experience on the frontend
- Clean up the Django backend or API flow
- Fix bugs and edge cases
- add or improve documentation
- Suggest me a better copy, labels, and visual polish
- feel free to Share feedback on what feels confusing or incomplete

## Local setup

The repo currently has two main parts:

- Frontend: React + Vite
- Backend: Django app

### Frontend

From the repository root:

```bash
cd frontend
npm install
npm run dev
```

That should start the local Vite dev server.

### Backend

If you want to work on the Django side, it’s best to set up a virtual environment first:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r ../docs/requirements.txt
python manage.py migrate
python manage.py runserver
```

## Before you open a pull request

please keep changes fairly focused, a good PR here is usually one of these:

- one bug fix / UI clean up
- one documentation improvement
- one backend adjustment with a clear reason

try not to mix a lot of unrelated changes into the same PR, it makes review much easier and helps keep the project history readable

## Code and review expectations

A few simple guidelines:

- keep the code readable and straightforward, prefer small changes
- match the existing structure of the repo as closely as possible

if  your change affects the UI, it helps to include a short explanation or screenshot so the i can quickly understand what improved


## Questions or ideas

if yorure unsure whether something fits the project, open an issue or start a discussion first, this repo is still evolving, so there is room for good ideas

thanks again for helping shape Haretna!!
