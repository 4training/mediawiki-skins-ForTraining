<?php
namespace ForTraining;
use SkinMustache;

class SkinForTraining extends SkinMustache {
    protected function runOnSkinTemplateNavigationHooks( $skin, &$content_navigation ) {
        parent::runOnSkinTemplateNavigationHooks($skin, $content_navigation);

        // Don't show login link for all visitors in the top right
        unset($content_navigation["user-menu"]["login"]);

        // Remove some entries from the user menu for logged-in users
        unset($content_navigation["user-menu"]["mytalk"]);
        unset($content_navigation["user-menu"]["userpage"]);
        unset($content_navigation["user-menu"]["watchlist"]);

        // Add the universal language selector (ULS) to the beginning of the user menu
        $content_navigation["user-menu"] = array("uls" => $content_navigation["user-interface-preferences"]["uls"])
             + $content_navigation["user-menu"];
    }
}

// for debugging
function console_log( $data ){
    echo '<script>';
    echo 'console.log('. json_encode( $data ) .')';
    echo '</script>';
}

?>