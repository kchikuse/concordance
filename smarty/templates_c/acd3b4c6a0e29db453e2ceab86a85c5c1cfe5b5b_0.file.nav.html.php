<?php
/* Smarty version 3.1.33, created on 2019-10-25 06:51:24
  from '/Users/KChikuse/work/MY/htdocs/concordance/templates/nav.html' */

/* @var Smarty_Internal_Template $_smarty_tpl */
if ($_smarty_tpl->_decodeProperties($_smarty_tpl, array (
  'version' => '3.1.33',
  'unifunc' => 'content_5db29b6c24cf36_57846044',
  'has_nocache_code' => false,
  'file_dependency' => 
  array (
    'acd3b4c6a0e29db453e2ceab86a85c5c1cfe5b5b' => 
    array (
      0 => '/Users/KChikuse/work/MY/htdocs/concordance/templates/nav.html',
      1 => 1571986246,
      2 => 'file',
    ),
  ),
  'includes' => 
  array (
  ),
),false)) {
function content_5db29b6c24cf36_57846044 (Smarty_Internal_Template $_smarty_tpl) {
?><details class="books">
    <summary>BOOKS</summary>
    <ul>
        <?php
$_from = $_smarty_tpl->smarty->ext->_foreach->init($_smarty_tpl, $_smarty_tpl->tpl_vars['books']->value, 'b');
if ($_from !== null) {
foreach ($_from as $_smarty_tpl->tpl_vars['b']->value) {
?>
            <li>
            <a href="<?php echo $_smarty_tpl->tpl_vars['b']->value['id'];?>
/1" <?php if ($_smarty_tpl->tpl_vars['b']->value['id'] == $_smarty_tpl->tpl_vars['book']->value['id']) {?> class="active" <?php }?>>
                <?php echo $_smarty_tpl->tpl_vars['b']->value['name'];?>

            </a>
            </li>
        <?php
}
}
$_smarty_tpl->smarty->ext->_foreach->restore($_smarty_tpl, 1);?>
    </ul>
</details>

<details class="chapters">
    <summary>CHAPTERS</summary>
    <ul>
        <?php
$_from = $_smarty_tpl->smarty->ext->_foreach->init($_smarty_tpl, $_smarty_tpl->tpl_vars['chapters']->value, 'c');
if ($_from !== null) {
foreach ($_from as $_smarty_tpl->tpl_vars['c']->value) {
?>
            <li>
            <a <?php if ($_smarty_tpl->tpl_vars['c']->value == $_smarty_tpl->tpl_vars['chapter']->value) {?> class="active" <?php } else { ?> href="<?php echo $_smarty_tpl->tpl_vars['book']->value['id'];?>
/<?php echo $_smarty_tpl->tpl_vars['c']->value;?>
" <?php }?>><?php echo $_smarty_tpl->tpl_vars['c']->value;?>
</a>
            </li>
        <?php
}
}
$_smarty_tpl->smarty->ext->_foreach->restore($_smarty_tpl, 1);?>
    </ul>
</details><?php }
}
