<?php
/* Smarty version 3.1.33, created on 2019-10-27 12:46:56
  from '/Users/KChikuse/work/MY/htdocs/concordance/templates/home.html' */

/* @var Smarty_Internal_Template $_smarty_tpl */
if ($_smarty_tpl->_decodeProperties($_smarty_tpl, array (
  'version' => '3.1.33',
  'unifunc' => 'content_5db591c06cf863_45979827',
  'has_nocache_code' => false,
  'file_dependency' => 
  array (
    '293914e710caf51716aa7f7cfa0bb18e9a721116' => 
    array (
      0 => '/Users/KChikuse/work/MY/htdocs/concordance/templates/home.html',
      1 => 1572174644,
      2 => 'file',
    ),
  ),
  'includes' => 
  array (
    'file:sidebar.html' => 1,
  ),
),false)) {
function content_5db591c06cf863_45979827 (Smarty_Internal_Template $_smarty_tpl) {
$_smarty_tpl->_checkPlugins(array(0=>array('file'=>'/Users/KChikuse/work/MY/htdocs/concordance/smarty/plugins/function.fetch.php','function'=>'smarty_function_fetch',),));
echo smarty_function_fetch(array('file'=>"style.css",'assign'=>"css"),$_smarty_tpl);?>

<?php echo smarty_function_fetch(array('file'=>"app.js",'assign'=>"js"),$_smarty_tpl);?>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="author" content="K Chikuse">
  <meta name="description" content="Concordance">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#418980">
  <link href="favicon.ico" rel="icon">
  <title>Concordance</title>
  <base href="<?php echo $_smarty_tpl->tpl_vars['baseUrl']->value;?>
">
  <style><?php echo preg_replace('!\s+!u', ' ',$_smarty_tpl->tpl_vars['css']->value);?>
</style>
</head>
<body data-book="<?php echo $_smarty_tpl->tpl_vars['vbook']->value;?>
" data-chapter="<?php echo $_smarty_tpl->tpl_vars['vchapter']->value;?>
">
<container><?php $_smarty_tpl->_subTemplateRender("file:sidebar.html", $_smarty_tpl->cache_id, $_smarty_tpl->compile_id, 0, $_smarty_tpl->cache_lifetime, array(), 0, false);
?><div class="verses"><h1><?php echo $_smarty_tpl->tpl_vars['book']->value['name'];?>
 <?php echo $_smarty_tpl->tpl_vars['chapter']->value;?>
</h1><?php
$_from = $_smarty_tpl->smarty->ext->_foreach->init($_smarty_tpl, $_smarty_tpl->tpl_vars['verses']->value, 'v');
if ($_from !== null) {
foreach ($_from as $_smarty_tpl->tpl_vars['v']->value) {
?><p><sup><?php echo $_smarty_tpl->tpl_vars['v']->value['verse'];?>
</sup> <?php echo remove_prefix($_smarty_tpl->tpl_vars['v']->value['text']);?>
</p><?php
}
}
$_smarty_tpl->smarty->ext->_foreach->restore($_smarty_tpl, 1);?></div></container><?php if ($_smarty_tpl->tpl_vars['sn']->value) {?><style id="ws">w[lemma="<?php echo $_smarty_tpl->tpl_vars['sn']->value;?>
"],w[lemma="strong:<?php echo $_smarty_tpl->tpl_vars['sn']->value;?>
"] {border-bottom: var(--text-hilite);}</style><?php }?>
</body>
<?php echo '<script'; ?>
><?php echo preg_replace('!\s+!u', ' ',$_smarty_tpl->tpl_vars['js']->value);
echo '</script'; ?>
>
</html><?php }
}
