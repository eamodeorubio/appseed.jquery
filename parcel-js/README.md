parcel-js
======

parcel-js is a dependencies management system for JS, CSS and AJAX resources. Although it is an independent JS library, it can also be used as a jQuery plugin.

Basically is a DSL that allows you to declare dependencies between artifacts and lazy load them whenever your system need them.

What problems solves parcel-js?
=========

Th first problem that parcel-js solves is the dynamic lazy loading problem. In some application scenarios, like a webtop or a Single Page Interface application, you should not load all of the libraries and artifacts you application needs.
The point is that some libraries only are needed when the user want to do some action in your system for the first time. For example, in a webtop, when a user launch an application then the system needs to download the code for it but not before.
In fact not all the users will see the same applications in its menu in a webtop enviroment. Downloading all the code for all applications available for all users in a webtop is simply overkill.

The other problem is the dependencies management between libraries. To understand this problem let's have a look at the jQuery UI plugin. If you want to use for example the jQuery UI dialog, you need to read the documentation to see what other libraries the dialog requires.
After that you need to read the required libraries' documentation to see if they need additional libraries and so on. In a medium to large size project you end spending a lot of time understanding what libraries you need to add to your page.
In fact this is a non trivial task. Several libraries can share several dependencies and form a graph of dependencies hard to manage and mantain.
That's why jQuery provides a "packaging" page that calculates all the required libraries and packages all of them in a single library.
But that is not enough if you need lazy dynamic loading, because you really don't know in advance what libraries your system will need, since it is only known at runtime depending on the user choices.
Other problem with the approach of the "packaging" page is that every time you modify you system and the set of libraries changes, you must visit the page again to repackage all the libraries again.

With parcel-js you only need to define for each artifact the first level of dependencies. This can be done inline of each of your libraries or in a separate "description" library, this way you can maintain the dependencies without effort.
You only need to add parcel-js to your page and instruct it to load the required libraries when appropiate. Then parcel-js will ensure to download in runtime only the needed libraries without duplications.
You can add callbacks too to receive notifications of the loading progress of each artifact. 

So if you are only developing an small and simple project with only a couple of libraries, and each application will be launched in a different page, then parcel-js perhaps is not for you.

What kind of artifacts can I manage with parcel-js?
=====

* Javascript libraries
* CSS stylesheets
* Any resource you can load using AJAX. For example, HTML fragments, HTML templates, JS, JSON or text.

But parcel-js adds a "virtual" artifact type called a "Package". A Package is a logic set of artifacts with a name. You can use Packages to simplify even more dependencies management and receive a notification when the whole set of artifacts are loaded.
For example, you can define an entire application, or subapplication as a Package and instruct parcel-js to load it. If the set of artifacts that composes your Package changes you only need to redefine it and the rest of your system won't notice this change.

Getting started & more information
====

You can visit the [Wiki for the project](https://github.com/eamodeorubio/appseed.jquery/wiki/Getting-started-with-parcel-js) for more information and documentation

License
===

Currently this project is licensed as Apache GNU LESSER GENERAL PUBLIC LICENSE Version 3

Authors
===

Currently the code base is created and maintained by [@eamodeorubio](https://github.com/eamodeorubio)

Feel free to fork the project and do pull request
