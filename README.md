# swr-models

[SWR](https://github.com/vercel/swr) toolkit for abstracting API data models as React state objects.

## Introduction

When working with an HTTP CRUD API, you typically use it to store and retrieve data models from a database.
Now, imagine you have a frontend application that interacts with this API. In this application, you can abstract
the API calls to such an extent that the data models behave like native React state objects. This abstraction
allows developers to work seamlessly with data models in the frontend, simplifying data manipulation and improving
the overall development experience.

## Quick Start

To get started, you need to install the package:

```bash
npm install swr-models --save-dev
```

Let's say you have an CRUD API that provides articles, and you have this API accessible from the frontend
application on `/api/models/articles/<id>` (for example with
[rewrite](https://nextjs.org/docs/pages/api-reference/config/next-config-js/rewrites)).

Create a typing file to define the shape of the article object returned by the API:

```typescript
// types/Article.d.ts

export interface ArticleModel {
    id: number;
    title: string;
    content: string;
}
```

Now you can define a model endpoint as follows:

```typescript
// endpoints/Articles.ts

import { SWRModelEndpoint } from "swr-models";
import { ArticleModel } from "../types/Article";

export const Articles = new SWRModelEndpoint<ArticleModel[]>({
    key: "/api/models/articles",
});
```

Now, you can use the `Articles` object to interact with the API from the React components:

```typescript
// components/Article.tsx

import { FC } from "react";
import { useModel } from "swr-models";

import { Articles } from "../endpoints/Articles"; 
import { ArticleModel } from "../types/Article";

type ArticleProps = {
    id: number;
};

export const Article: FC<ArticleProps> = ({ id }) => {
    const { model } = useModel<ArticleModel>(Articles, { id });
    const { data: oneArticle } = Articles.use<ArticleModel>({ id });
    const { data: allArticles } = Articles.use();
    //...
};
```

The `useModel` hook provides you with a set of functions to work with the model object:

```typescript
const {
    model,
    set,
    reset,
    original,
    lock,
    unlock,
    commit
} = useModel<ArticleModel>(Articles, { id });
```

- `model` is the current state of the model object.
- `set` allows you to update the model object.
- `reset` resets the model object to its original state.
- `original` is the original state of the model object.
- `lock` locks the model object, preventing updates.
- `unlock` unlocks the model object, allowing updates.
- `commit` commits the changes to the API.

You can use these functions to interact with the model object in a way that feels like working with a native React
state object.

If you for example have a Popup component with a form to edit the article inside the `Article.tsx` component,
you can use the `lock` and `unlock` functions to prevent any unwanted updates from API while the form is open,
bind `set` to Input fields and appropriately update the model state, and `commit` the changes when the form is
saved or `reset` the changes when the form is closed.
