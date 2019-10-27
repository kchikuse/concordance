<?php
/* Smarty version 3.1.33, created on 2019-10-24 15:44:43
  from '/Users/KChikuse/work/MY/htdocs/concordance/templates/search.html' */

/* @var Smarty_Internal_Template $_smarty_tpl */
if ($_smarty_tpl->_decodeProperties($_smarty_tpl, array (
  'version' => '3.1.33',
  'unifunc' => 'content_5db1c6eb7a3064_97847743',
  'has_nocache_code' => false,
  'file_dependency' => 
  array (
    'c43cb035df4363e18aa0353aa9979b167e4c74a1' => 
    array (
      0 => '/Users/KChikuse/work/MY/htdocs/concordance/templates/search.html',
      1 => 1571821265,
      2 => 'file',
    ),
  ),
  'includes' => 
  array (
  ),
),false)) {
function content_5db1c6eb7a3064_97847743 (Smarty_Internal_Template $_smarty_tpl) {
?><ul class="search-results">
    <?php
$_from = $_smarty_tpl->smarty->ext->_foreach->init($_smarty_tpl, $_smarty_tpl->tpl_vars['easton']->value, 'd');
if ($_from !== null) {
foreach ($_from as $_smarty_tpl->tpl_vars['d']->value) {
?>
    <li><span><?php echo $_smarty_tpl->tpl_vars['d']->value['word'];?>
</span> - <?php echo $_smarty_tpl->tpl_vars['d']->value['description'];?>
</li>
    <?php
}
}
$_smarty_tpl->smarty->ext->_foreach->restore($_smarty_tpl, 1);?>
</ul><?php }
}
