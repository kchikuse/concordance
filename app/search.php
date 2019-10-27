<?php

class Search {
    private $redirect;
    private $data;

    public function __construct($redirect, $data) {
        $this->redirect = $redirect;
        $this->data = $data;
    }

    public function redirect() {
        return $this->redirect;
    }

    public function data() {
        return $this->data;
    }
}