<?php

namespace Drupal\custom\EventSubscriber;

use Drupal\Core\EventSubscriber\HttpExceptionSubscriberBase;
use Symfony\Component\HttpKernel\Event\GetResponseForExceptionEvent;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Drupal\Core\Url;

class RedirectOn404Subscriber extends HttpExceptionSubscriberBase {

  public function __construct() {
  }

  protected function getHandledFormats() {
    return ['html'];
  }

  public function getPath() {
    $uri = \Drupal::request()->getRequestUri();
    return explode('?', $uri)[0];
  }

  public function on404(GetResponseForExceptionEvent $event) {
    $path = $this->getPath();

    $map = [
      '/hvem-er-vi' => '/da#aboutUs',
      '/goer-en-forskel' => '/da#aboutUs',
      '/partnere' => '/da#aboutUs',
      '/hvad' => '/da#services',
      '/saadan-virker-det' => '/da#services',
      '/cloud' => '/da#services',
      '/local' => '/da#services',
      '/kontakt' => '/da#contacts',
      '/en/hvem-er-vi' => '/en#aboutUs',
      '/en/partners' => '/en#aboutUs',
      '/en/goer-en-forskel' => '/en#aboutUs',
      '/en/hvad' => '/en#services',
      '/en/saadan-virker-det' => '/en#services',
      '/en/cloud' => '/en#services',
      '/en/local' => '/en#services',
      '/en/kontakt' => '/en#contacts',
      '/no' => '/nb',
      '/no/rask-oversikt' => '/nb#services',
      '/no/slik-virker-det' => '/nb#services',
      '/no/cloud' => '/nb#services',
      '/no/local' => '/nb#services',
      '/no/hvem-er-vi' => '/nb#aboutUs',
      '/no/partnere' => '/nb#aboutUs',
      '/no/bcomesafe-kan-utgjoere-forskjell' => '/nb#aboutUs',
      '/no/kontakt-oss' => '/nb#contacts',
    ];
    if (array_key_exists($path, $map)) {
      $event->setResponse(new RedirectResponse($map[$path], 301));
    }
  }
}