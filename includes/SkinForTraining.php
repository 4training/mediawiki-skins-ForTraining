<?php

use MediaWiki\MediaWikiServices;

/*
 * Our skin class: Customizing some behaviors by overriding methods
 */
class SkinForTraining extends SkinMustache {

    public function getTemplateData() {
        $data = parent::getTemplateData();

        // Provide a number of system messages we need
        $data['msg-headnav-essentials'] = $this->msg('headnav-essentials')->parse();
        $data['msg-headnav-more'] = $this->msg('headnav-more')->parse();
        $data['msg-headnav-languages'] = $this->msg('headnav-languages')->parse();
        $data['msg-headnav-faq'] = $this->msg('headnav-faq')->parse();
        $data['msg-contactpage-title'] = $this->msg('contactpage-title')->parse();
        $data['msg-headnav-collapsemenu'] = $this->msg('headnav-collapsemenu')->parse();
        $data['msg-headnav-expandmenu'] = $this->msg('headnav-expandmenu')->parse();

        if (!$this->loggedin) {
            // Show toolbox in the sidebar only for logged-in users
            unset($data['data-portlets-sidebar']['array-portlets-rest']);

            // Show right navigation only to logged-in users
            unset($data['data-portlets']['data-namespaces']);
            unset($data['data-portlets']['data-views']);
            unset($data['data-portlets']['data-actions']);
        } else {
            // Show namespaces (page / discussion page) only to admin
            $groupManager = MediaWikiServices::getInstance()->getUserGroupManager();
            if (!in_array('sysop', $groupManager->getUserEffectiveGroups($this->getUser()))) {
                // $this->getUser->getEffectiveGroups() doesn't work anymore: https://phabricator.wikimedia.org/T275148
                unset($data['data-portlets']['data-namespaces']);
            }

            // Show guidelines only to logged-in users
            $data['data-guidelines'] = true;
        }
        return $data;
    }

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

    protected function getFooterLinks(): array {
        $data = parent::getFooterLinks();

        // Only show "This page was last edited on ..." for logged-in users
        if (!$this->loggedin) {
            unset($data['info']);
        }

        // Another way to add the login link... maybe use this instead of writing it in skin.mustache?
        // $data["info"]["login"] = '<a href="/Special:UserLogin">Login</a></li>';
        return $data;
    }
}

// for debugging
function console_log( $data ){
    echo '<script>';
    echo 'console.log('. json_encode( $data ) .')';
    echo '</script>';
}

?>