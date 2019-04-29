<?php

namespace Drupal\custom\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Url;

class Homepage extends ControllerBase {

  /**
   * Returns a page title.
   */
  public function title() {
    return  'Home';
  }

  /**
   * Returns a page render array.
   */
  public function content() {
    $build = [];

    $manager = \Drupal::entityTypeManager();

    $tabs = $manager->getStorage('node')->loadByProperties([
      'field_page_type' => 'tab_content',
      'status' => 1,
    ]);

    $blocks_config = $manager->getStorage('block')->loadByProperties([
      'region' => 'content_blocks',
      'status' => 1,
    ]);

    $blocks_content = $manager->getStorage('block_content')->loadByProperties([
      'type' => 'content'
    ]);

    $menu_items = $manager->getStorage('menu_link_content')->loadByProperties([
      'menu_name' => 'main',
      'enabled' => 1,
    ]);

    // get url parameter of enabled menu items and sort by weight
    $enabled = [];
    foreach ($menu_items as $item) {
      if (substr($item->link->uri, 0, 11) === 'internal:/#') {
        $id = substr($item->link->uri, 11);
        $enabled[$id] = $item->weight->value; 
      }
    }
    asort($enabled);
    $enabled = array_keys($enabled);

    // sort blocks
    uasort($blocks_config, function($a, $b) {
      return $a->getWeight() - $b->getWeight();
    });

    // prepare tab content
    foreach ($tabs as $key => $tab) {
      $frontpage = Url::fromRoute('<front>')->toString();
      $edit_access = $tab->access('edit', \Drupal::currentUser());
      $edit_url = Url::fromRoute('entity.node.edit_form', array('node' => $key, 'destination' => $frontpage))->toString();

      $tabs[$key]->tab_enabled = in_array($tab->field_tab_id->value, $enabled);
      $tabs[$key]->tab_id = $tab->field_tab_id->value;
      $tabs[$key]->tab_class = $tab->field_tab_id->value == $enabled[0] ? ' in active' : '';
      $tabs[$key]->tab_edit = $edit_access ? '<a class="custom-tab-edit" href="'.$edit_url.'"><i class="fa fa-edit"></i> '.t('Edit tab').'</a>' : '';
      $tabs[$key]->tab_content = !empty($tab->body->value) ? $manager->getViewBuilder('node')->view($tab, 'tab') : '';
    }

    // add blocks to tabs
    foreach ($blocks_config as $key => $config) {

      $content_block = $this->getBlockByPluginId($config->getPluginId(), $blocks_content);
      if (!$content_block) continue;

      $page_ref = $content_block->field_ref_page->target_id;
      if (!$page_ref) continue;

      $classes = $content_block->field_classes->value;

      if ($content_block->field_remove_drupal_wrapper->value) {
        $content = $content_block->body->value;
      } else {
        $content = $manager->getViewBuilder('block')->view($config);
      }

      $tabs[$page_ref]->tab_blocks[$key] = [
        'content' => $content,
        'classes' => $classes ? ' '.$classes : '',
      ];
    }

    $build['#theme'] = 'custom_homepage';
    $build['#data'] = [
      'tabs' => $tabs,
    ];

    return $build;
  }


  private function getBlockByPluginId($name, $objects) {
    foreach ($objects as $object) {
      if (strpos($name, $object->uuid()) !== FALSE) {
        return $object;
      }
    }
    return NULL;
  }

}