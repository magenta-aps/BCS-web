<?php

namespace Drupal\custom\EventSubscriber;

use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\HttpKernel\Event\GetResponseEvent;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

class CustomRedirectSubscriber implements EventSubscriberInterface {

  public function checkForRedirection(GetResponseEvent $event) {
    $attr = $event->getRequest()->attributes;

    if (!empty($attr) && !empty($attr->get('_route')) && $attr->get('_route') == 'entity.node.canonical') {
      if (!empty($attr->get('node')) && $attr->get('node')->field_page_type->value == 'tab_content') {
        $event->setResponse(new RedirectResponse(\Drupal::url('<front>')));
      }
    }
  }

  static function getSubscribedEvents() {
    $events[KernelEvents::REQUEST][] = array('checkForRedirection');
    return $events;
  }

}