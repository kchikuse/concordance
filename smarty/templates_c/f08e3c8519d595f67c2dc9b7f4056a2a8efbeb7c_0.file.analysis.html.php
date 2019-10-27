<?php
/* Smarty version 3.1.33, created on 2019-10-27 14:15:49
  from '/Users/KChikuse/work/MY/htdocs/concordance/templates/analysis.html' */

/* @var Smarty_Internal_Template $_smarty_tpl */
if ($_smarty_tpl->_decodeProperties($_smarty_tpl, array (
  'version' => '3.1.33',
  'unifunc' => 'content_5db5a695c2e963_02366335',
  'has_nocache_code' => false,
  'file_dependency' => 
  array (
    'f08e3c8519d595f67c2dc9b7f4056a2a8efbeb7c' => 
    array (
      0 => '/Users/KChikuse/work/MY/htdocs/concordance/templates/analysis.html',
      1 => 1572185747,
      2 => 'file',
    ),
  ),
  'includes' => 
  array (
  ),
),false)) {
function content_5db5a695c2e963_02366335 (Smarty_Internal_Template $_smarty_tpl) {
if ($_smarty_tpl->tpl_vars['links']->value) {?><div class="strong-links"><details open><summary>OTHER USES</summary><ul><?php
$_from = $_smarty_tpl->smarty->ext->_foreach->init($_smarty_tpl, $_smarty_tpl->tpl_vars['links']->value, 'lnk');
if ($_from !== null) {
foreach ($_from as $_smarty_tpl->tpl_vars['lnk']->value) {
?><li><a href="<?php echo $_smarty_tpl->tpl_vars['lnk']->value['book'];?>
/<?php echo $_smarty_tpl->tpl_vars['lnk']->value['chapter'];?>
/<?php echo $_smarty_tpl->tpl_vars['sn']->value;?>
"><?php echo $_smarty_tpl->tpl_vars['lnk']->value['name'];?>
. <?php echo $_smarty_tpl->tpl_vars['lnk']->value['chapter'];?>
</a></li><?php
}
}
$_smarty_tpl->smarty->ext->_foreach->restore($_smarty_tpl, 1);?></ul></details></div><?php }
$_from = $_smarty_tpl->smarty->ext->_foreach->init($_smarty_tpl, $_smarty_tpl->tpl_vars['words']->value, 'word');
if ($_from !== null) {
foreach ($_from as $_smarty_tpl->tpl_vars['word']->value) {
?><div class="card"><span><?php echo $_smarty_tpl->tpl_vars['word']->value['number'];?>
</span><p class="lemma"><b><?php echo $_smarty_tpl->tpl_vars['word']->value['lemma'];?>
</b></p><?php if ($_smarty_tpl->tpl_vars['word']->value['translit']) {?><p><i><?php echo $_smarty_tpl->tpl_vars['word']->value['translit'];?>
</i></p><?php }
if ($_smarty_tpl->tpl_vars['word']->value['pron']) {?><p><i><?php echo $_smarty_tpl->tpl_vars['word']->value['pron'];?>
</i></p><?php }?><p><?php echo $_smarty_tpl->tpl_vars['word']->value['derivation'];?>
</p><p><?php echo $_smarty_tpl->tpl_vars['word']->value['strongs_def'];?>
</p><p><?php echo $_smarty_tpl->tpl_vars['word']->value['kjv_def'];?>
</p><?php if ($_smarty_tpl->tpl_vars['word']->value['xlit']) {?><p><?php echo $_smarty_tpl->tpl_vars['word']->value['xlit'];?>
</p><?php }?></div><?php
}
}
$_smarty_tpl->smarty->ext->_foreach->restore($_smarty_tpl, 1);
}
}
