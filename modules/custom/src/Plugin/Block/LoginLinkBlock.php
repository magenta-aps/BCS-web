<?php

namespace Drupal\custom\Plugin\Block;

use Drupal\Core\Block\BlockBase;

/**
 * @Block(
 *   id = "custom_login_link",
 *   admin_label = @Translation("System: login link")
 * )
 */
class LoginLinkBlock extends BlockBase {

  public function build() {
    $build = [];

    $build['#theme'] = 'custom_login_link';
    $build['#data'] = [];

    return $build;
  }

}
