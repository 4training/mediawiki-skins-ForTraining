<?php
namespace ForTraining;
use SkinMustache;
use Sanitizer;
use Linker;
use Html;

class SkinForTraining extends SkinMustache {
    protected function runOnSkinTemplateNavigationHooks( $skin, &$content_navigation ) {
        parent::runOnSkinTemplateNavigationHooks($skin, $content_navigation);
        unset($content_navigation["user-menu"]["mytalk"]);
        unset($content_navigation["user-menu"]["userpage"]);
        unset($content_navigation["user-menu"]["watchlist"]);
    }
}

class ForTrainingHooks {
    /*
    * This is attached to the MediaWiki 'SkinTemplateNavigation::Universal' hook.
    * TODO: Remove this - didn't work out in the end because this hook is run on an arbitrary time
    * and e.g. the hook from Universal language selector has not yet run, so we can't modify it
    * -> overwrite runOnSkinTemplateNavigationHooks
    */
    public static function onSkinTemplateNavigationUniversal( $skinTemplate, array &$links) {
        console_log($links["user-interface-preferences"]);
        unset($links["user-menu"]["mytalk"]);
        unset($links["user-menu"]["userpage"]);
        unset($links["user-menu"]["watchlist"]);
    }

}

// for debugging
function console_log( $data ){
    echo '<script>';
    echo 'console.log('. json_encode( $data ) .')';
    echo '</script>';
}

?>