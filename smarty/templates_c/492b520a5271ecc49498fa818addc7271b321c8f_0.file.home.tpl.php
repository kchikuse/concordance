<?php
/* Smarty version 3.1.33, created on 2019-09-24 13:29:19
  from '/Users/KChikuse/work/MY/htdocs/concordance/templates/home.tpl' */

/* @var Smarty_Internal_Template $_smarty_tpl */
if ($_smarty_tpl->_decodeProperties($_smarty_tpl, array (
  'version' => '3.1.33',
  'unifunc' => 'content_5d8a1a2f40d586_19909649',
  'has_nocache_code' => false,
  'file_dependency' => 
  array (
    '492b520a5271ecc49498fa818addc7271b321c8f' => 
    array (
      0 => '/Users/KChikuse/work/MY/htdocs/concordance/templates/home.tpl',
      1 => 1569329895,
      2 => 'file',
    ),
  ),
  'includes' => 
  array (
    'file:navbar.tpl' => 1,
    'file:verses.tpl' => 1,
  ),
),false)) {
function content_5d8a1a2f40d586_19909649 (Smarty_Internal_Template $_smarty_tpl) {
?><!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="author" content="K Chikuse">
  <meta name="description" content="Concordance">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="theme-color" content="#418980">
  <link href="favicon.ico" rel="icon">
  <link href="favicon.ico" rel="apple-touch-icon">
  <link href="assets/css/materialize.css" rel="stylesheet">
  <link href="assets/css/style.css" rel="stylesheet">
  <title>Concordance</title>
</head>
<body>
  <?php $_smarty_tpl->_subTemplateRender("file:navbar.tpl", $_smarty_tpl->cache_id, $_smarty_tpl->compile_id, 0, $_smarty_tpl->cache_lifetime, array(), 0, false);
?>
  <?php $_smarty_tpl->_subTemplateRender("file:verses.tpl", $_smarty_tpl->cache_id, $_smarty_tpl->compile_id, 0, $_smarty_tpl->cache_lifetime, array(), 0, false);
?>
  <?php echo '<script'; ?>
 src="app.js"><?php echo '</script'; ?>
>
</body>
</html><?php }
}
