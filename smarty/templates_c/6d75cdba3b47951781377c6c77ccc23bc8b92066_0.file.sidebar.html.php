<?php
/* Smarty version 3.1.33, created on 2019-10-27 11:04:35
  from '/Users/KChikuse/work/MY/htdocs/concordance/templates/sidebar.html' */

/* @var Smarty_Internal_Template $_smarty_tpl */
if ($_smarty_tpl->_decodeProperties($_smarty_tpl, array (
  'version' => '3.1.33',
  'unifunc' => 'content_5db579c3983f49_83900242',
  'has_nocache_code' => false,
  'file_dependency' => 
  array (
    '6d75cdba3b47951781377c6c77ccc23bc8b92066' => 
    array (
      0 => '/Users/KChikuse/work/MY/htdocs/concordance/templates/sidebar.html',
      1 => 1572174262,
      2 => 'file',
    ),
  ),
  'includes' => 
  array (
  ),
),false)) {
function content_5db579c3983f49_83900242 (Smarty_Internal_Template $_smarty_tpl) {
?><sidebar><div class="search"><label for="search"><input id="search" type="search" placeholder="Search..." autocomplete="off" aria-label="Search"></label></div><details class="books"><summary>BOOKS</summary><ul><?php
$_from = $_smarty_tpl->smarty->ext->_foreach->init($_smarty_tpl, $_smarty_tpl->tpl_vars['books']->value, 'b');
if ($_from !== null) {
foreach ($_from as $_smarty_tpl->tpl_vars['b']->value) {
?><li><a href="<?php echo $_smarty_tpl->tpl_vars['b']->value['id'];?>
"<?php if ($_smarty_tpl->tpl_vars['b']->value['id'] == $_smarty_tpl->tpl_vars['book']->value['id']) {?> class="active" <?php }?>><?php echo $_smarty_tpl->tpl_vars['b']->value['name'];?>
 </a></li><?php
}
}
$_smarty_tpl->smarty->ext->_foreach->restore($_smarty_tpl, 1);?></ul></details><details class="chapters"><summary>CHAPTERS</summary><ul><?php
$_from = $_smarty_tpl->smarty->ext->_foreach->init($_smarty_tpl, $_smarty_tpl->tpl_vars['chapters']->value, 'c');
if ($_from !== null) {
foreach ($_from as $_smarty_tpl->tpl_vars['c']->value) {
?><li><a href="<?php echo $_smarty_tpl->tpl_vars['book']->value['id'];?>
/<?php echo $_smarty_tpl->tpl_vars['c']->value;?>
"<?php if ($_smarty_tpl->tpl_vars['c']->value == $_smarty_tpl->tpl_vars['chapter']->value) {?> class="active" <?php }?>><?php echo $_smarty_tpl->tpl_vars['c']->value;?>
</a></li><?php
}
}
$_smarty_tpl->smarty->ext->_foreach->restore($_smarty_tpl, 1);?></ul></details><div class="analysis"><?php echo get_analysis($_smarty_tpl->tpl_vars['sn']->value);?>
</div><div class="verse-nav"><a href="<?php echo $_smarty_tpl->tpl_vars['prev']->value['book'];?>
/<?php echo $_smarty_tpl->tpl_vars['prev']->value['chapter'];?>
" aria-label="Back"><arrow left></arrow></a><a href="<?php echo $_smarty_tpl->tpl_vars['next']->value['book'];?>
/<?php echo $_smarty_tpl->tpl_vars['next']->value['chapter'];?>
" aria-label="Next"><arrow right></arrow></a></div></sidebar><?php }
}
