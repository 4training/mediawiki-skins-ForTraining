<?php

use MediaWiki\MediaWikiServices;

/*
 * Our skin class: Customizing some behaviors by overriding methods
 */

class SkinForTraining extends SkinMustache
{

    public function getTemplateData()
    {
        $data = parent::getTemplateData();

        // Extract and structure translation language data
        $data = $this->extractTranslationLanguages($data);

        $data['user-logged-in'] = true;

        $data['icon-user-menu-gear'] = $this->getIconSvg('user-menu-gear');
        $data['icon-language-menu'] = $this->getIconSvg('language-menu');

        // Provide a number of system messages we need
        $data['msg-headnav-essentials'] = $this->msg('headnav-essentials')->parse();
        $data['msg-headnav-more'] = $this->msg('headnav-more')->parse();
        $data['msg-headnav-languages'] = $this->msg('headnav-languages')->parse();
        $data['msg-headnav-faq'] = $this->msg('headnav-faq')->parse();
        $data['msg-contactpage-title'] = $this->msg('contactpage-title')->parse();
        $data['msg-headnav-collapsemenu'] = $this->msg('headnav-collapsemenu')->parse();
        $data['msg-headnav-expandmenu'] = $this->msg('headnav-expandmenu')->parse();

        // Add links for the sidebar top-level elements: Links are hard-coded
        // We didn't find a better solution to implement this as the function SkinTemplate::getPortletData()
        // is private and can't be overwritten
        $data['data-portlets-sidebar']['data-portlets-first']['href'] = '/Special:MyLanguage/Start';
        foreach ($data['data-portlets-sidebar']['array-portlets-rest'] as &$sidebar_block) {
            if ($sidebar_block['id'] == 'p-headnav-essentials') {
                $sidebar_block['href'] = '/Special:MyLanguage/Essentials';
            } elseif ($sidebar_block['id'] == 'p-headnav-more') {
                $sidebar_block['href'] = '/Special:MyLanguage/More';
            }
        }

        // Remove the title for the p-personal menu object
        if (isset($data['data-portlets']['data-user-menu'])) {
            unset($data['data-portlets']['data-personal']['label']);
            unset($data['data-portlets']['data-user-menu']['label']);
        }

        // Parse the sidebar menus into accordion
        $data = $this->processSidebarPortlets($data);

        if (!$this->loggedin) {
            $data['user-logged-in'] = false;
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

    protected function runOnSkinTemplateNavigationHooks($skin, &$content_navigation)
    {
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

    protected function getFooterLinks(): array
    {
        $data = parent::getFooterLinks();

        // Only show "This page was last edited on ..." for logged-in users
        if (!$this->loggedin) {
            unset($data['info']);

            // Set the login link for logged-out users
            $data["info"]["login"] = '
            <div>
              <div id="footer-login" class="mt-1">
                <div id="footer-loginlink">
                  <a href="/Special:UserLogin"
                     class="text-lg lg:text-xl font-semibold hover:bg-blue-50 hover:text-blue-600 hover:cursor-pointer">
                    Login
                  </a>
                </div>
              </div>
            </div>';
        }

        // Another way to add the login link... maybe use this instead of writing it in skin.mustache?
        // $data["info"]["login"] = '<a href="/Special:UserLogin">Login</a></li>';

        return $data;
    }

    /**
     * Load SVG icon from the assets/icons folder
     *
     * @param string $iconName Name of the icon file (without .svg extension)
     * @return string The SVG content as an HTML-safe string
     */
    private function getIconSvg($iconName)
    {
        $iconPath = __DIR__ . '/../resources/assets/icons/' . $iconName . '.svg';

        if (file_exists($iconPath)) {
            return file_get_contents($iconPath);
        }

        return '';
    }

    /**
     * Extract translation languages from the Translate extension's HTML output
     * and structure them as data for the template
     *
     * @param array $data Template data array
     * @return array Modified template data with translation-languages key
     */
    private function extractTranslationLanguages(array $data): array
    {
        if (!isset($data['html-body-content'])) {
            return $data;
        }

        $htmlContent = $data['html-body-content'];

        // Parse HTML content
        $dom = new DOMDocument();
        @$dom->loadHTML('<?xml encoding="UTF-8">' . $htmlContent, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
        $xpath = new DOMXPath($dom);

        // Find the translate extension language selector
        $langDiv = $xpath->query('//div[contains(@class, "mw-pt-languages")]')->item(0);

        if (!$langDiv) {
            return $data;
        }

        // Extract language links
        $languages = $this->parseLanguageLinks($xpath, $langDiv);

        // Find current language
        $currentLang = $this->getCurrentLanguage($xpath, $langDiv);

        // Add structured data
        $data['translation-languages'] = [
            'has-languages' => !empty($languages),
            'current' => $currentLang,
            'count' => count($languages) + 1, // +1 for current language
            'languages' => $languages
        ];

        // Remove the language selector from body content
        $langDiv->parentNode->removeChild($langDiv);
        $data['html-body-content'] = $dom->saveHTML();

        return $data;
    }

    /**
     * Parse language links from the translate extension's language selector
     *
     * @param DOMXPath $xpath XPath query object
     * @param DOMElement $langDiv The language selector container element
     * @return array Array of language link data
     */
    private function parseLanguageLinks(DOMXPath $xpath, DOMElement $langDiv): array
    {
        $languages = [];
        $links = $xpath->query('.//li/a', $langDiv);

        foreach ($links as $link) {
            $languages[] = [
                'href' => $link->getAttribute('href'),
                'title' => $link->getAttribute('title'),
                'lang' => $link->getAttribute('lang'),
                'dir' => $link->getAttribute('dir'),
                'text' => trim($link->textContent),
                'progress-class' => $link->getAttribute('class')
            ];
        }

        return $languages;
    }

    /**
     * Get the current language name from the translate extension's language selector
     *
     * @param DOMXPath $xpath XPath query object
     * @param DOMElement $langDiv The language selector container element
     * @return string Current language name
     */
    private function getCurrentLanguage(DOMXPath $xpath, DOMElement $langDiv): string
    {
        $currentSpan = $xpath->query(
            './/li/span[contains(@class, "mw-pt-languages-selected")]',
            $langDiv
        )->item(0);

        return $currentSpan ? trim($currentSpan->textContent) : 'English';
    }

    /**
     * Process sidebar portlets to extract items as structured data
     * Handles both data-portlets-first and array-portlets-rest
     *
     * @param array $data Template data array
     * @return array Modified template data with structured sidebar items
     */
    private function processSidebarPortlets(array $data): array {
        if (!isset($data['data-portlets-sidebar'])) {
            return $data;
        }

        $sidebar = &$data['data-portlets-sidebar'];

        // Process data-portlets-first (single portlet object)
        if (isset($sidebar['data-portlets-first']) && !empty($sidebar['data-portlets-first'])) {
            $this->processPortlet($sidebar['data-portlets-first']);
        }

        // Process array-portlets-rest (array of portlets)
        if (isset($sidebar['array-portlets-rest']) && is_array($sidebar['array-portlets-rest'])) {
            foreach ($sidebar['array-portlets-rest'] as &$portlet) {
                $this->processPortlet($portlet);
            }
        }

        return $data;
    }

    /**
     * Process a single portlet to determine its type and extract items
     *
     * @param array $portlet Portlet data (passed by reference)
     */
    private function processPortlet(array &$portlet): void {
        $portlet['array-items'] = $this->parsePortletItems($portlet['html-items'] ?? '');
        $portlet['item-count'] = count($portlet['array-items']);

        // Determine if this is a direct link or a container with sub-items
        $portlet['is-direct-link'] = ($portlet['item-count'] === 0 && !empty($portlet['href']));
        $portlet['has-children'] = ($portlet['item-count'] > 0);
    }

    /**
     * Parse HTML list items into structured array
     *
     * @param string $htmlItems HTML string of list items
     * @return array Array of item data
     */
    private function parsePortletItems(string $htmlItems): array {
        if (empty($htmlItems)) {
            return [];
        }

        $dom = new DOMDocument();
        @$dom->loadHTML('<?xml encoding="UTF-8"><ul>' . $htmlItems . '</ul>', LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
        $xpath = new DOMXPath($dom);

        $items = [];
        $listItems = $xpath->query('//li');

        foreach ($listItems as $li) {
            $link = $xpath->query('.//a', $li)->item(0);

            if ($link) {
                $items[] = [
                    'id' => $li->getAttribute('id'),
                    'class' => $li->getAttribute('class'),
                    'href' => $link->getAttribute('href'),
                    'text' => trim($link->textContent)
                ];
            }
        }

        return $items;
    }

// for debugging
    function console_log($data)
    {
        echo '<script>';
        echo 'console.log(' . json_encode($data) . ')';
        echo '</script>';
    }
}

?>
