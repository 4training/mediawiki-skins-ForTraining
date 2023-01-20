# Skin for 4training.net based on the new SkinMustache template

This is a port of our [current frontend from the old SkinTemplate-based system](https://github.com/4training/ForTraining) to the new mediawiki skinning system based on Mustache, following the [migration guide](https://www.mediawiki.org/wiki/Manual:How_to_make_a_MediaWiki_skin/Migrating_SkinTemplate_based_skins_to_SkinMustache)

The result should look identical to what we're running before, just the internals change. The design is still outdated and hopefully gets replaced soon by a better and mobile-friendly design.

## Purpose and rationale
The main reason for this port is to enable the update to mediawiki 1.39 LTS of our site. Trying to make the old SkinTemplate-based skin run on 1.39 wasn't successful. After investing several hours into fixing the various PHP errors and warnings the skin wasn't throwing exceptions anymore but still it wasn't running smoothly. Instead of investing potentially many more hours into digging deep to understand what exactly the issues are and fixing them, we decided to abandon that attempt and instead re-implement the skin based on SkinMustache. The big benefit now is to get familiar with the new mediawiki skinning approach. That's important as a successor of this skin will also be based on SkinMustache.

## Implementation details
The basis of the code is the [Example skin](https://github.com/wikimedia/mediawiki-skins-Example). Now everything from `ForTrainingTemplate.php` goes to `skin.mustache`, CSS needs to be copied as well as a little JS and then some extra functionality needs to be implemented with PHP.