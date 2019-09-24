<?php
/* Smarty version 3.1.33, created on 2019-09-24 13:32:49
  from '/Users/KChikuse/work/MY/htdocs/concordance/templates/verses.tpl' */

/* @var Smarty_Internal_Template $_smarty_tpl */
if ($_smarty_tpl->_decodeProperties($_smarty_tpl, array (
  'version' => '3.1.33',
  'unifunc' => 'content_5d8a1b010a7169_32581494',
  'has_nocache_code' => false,
  'file_dependency' => 
  array (
    '00c9eda19cef8da8560a25fc7845575b29aff88b' => 
    array (
      0 => '/Users/KChikuse/work/MY/htdocs/concordance/templates/verses.tpl',
      1 => 1569331962,
      2 => 'file',
    ),
  ),
  'includes' => 
  array (
  ),
),false)) {
function content_5d8a1b010a7169_32581494 (Smarty_Internal_Template $_smarty_tpl) {
?><div class="verses row">
    <?php
$_from = $_smarty_tpl->smarty->ext->_foreach->init($_smarty_tpl, $_smarty_tpl->tpl_vars['verses']->value, 'verse');
if ($_from !== null) {
foreach ($_from as $_smarty_tpl->tpl_vars['verse']->value) {
?>
        <p><?php echo $_smarty_tpl->tpl_vars['verse']->value['verse'];?>
 <?php echo $_smarty_tpl->tpl_vars['verse']->value['text'];?>
</p>
    <?php
}
}
$_smarty_tpl->smarty->ext->_foreach->restore($_smarty_tpl, 1);?>
</div><?php }
}
