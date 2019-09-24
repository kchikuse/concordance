<?php
/* Smarty version 3.1.33, created on 2019-09-24 13:53:02
  from '/Users/KChikuse/work/MY/htdocs/concordance/templates/navbar.tpl' */

/* @var Smarty_Internal_Template $_smarty_tpl */
if ($_smarty_tpl->_decodeProperties($_smarty_tpl, array (
  'version' => '3.1.33',
  'unifunc' => 'content_5d8a1fbe814780_04614311',
  'has_nocache_code' => false,
  'file_dependency' => 
  array (
    '9f4ddeaa9e746a9d2d17e66ea2b5e15f4d98e258' => 
    array (
      0 => '/Users/KChikuse/work/MY/htdocs/concordance/templates/navbar.tpl',
      1 => 1569333131,
      2 => 'file',
    ),
  ),
  'includes' => 
  array (
  ),
),false)) {
function content_5d8a1fbe814780_04614311 (Smarty_Internal_Template $_smarty_tpl) {
?><nav>
    <div class="nav-wrapper">
        <a href="#" class="brand-logo right">Concordance</a>

        <select class="book left">
            <?php
$_from = $_smarty_tpl->smarty->ext->_foreach->init($_smarty_tpl, $_smarty_tpl->tpl_vars['books']->value, 'bk');
if ($_from !== null) {
foreach ($_from as $_smarty_tpl->tpl_vars['bk']->value) {
?>
                <option value="<?php echo $_smarty_tpl->tpl_vars['bk']->value['id'];?>
" chapters="<?php echo $_smarty_tpl->tpl_vars['bk']->value['chapters'];?>
" 
                <?php if ($_smarty_tpl->tpl_vars['book']->value == $_smarty_tpl->tpl_vars['bk']->value['id']) {?> selected="selected"<?php }?>><?php echo $_smarty_tpl->tpl_vars['bk']->value['name'];?>
</option>
            <?php
}
}
$_smarty_tpl->smarty->ext->_foreach->restore($_smarty_tpl, 1);?>
        </select>

        <select class="chapter left">
            <?php
$_from = $_smarty_tpl->smarty->ext->_foreach->init($_smarty_tpl, $_smarty_tpl->tpl_vars['chapters']->value, 'ch');
if ($_from !== null) {
foreach ($_from as $_smarty_tpl->tpl_vars['ch']->value) {
?>
                <option value="<?php echo $_smarty_tpl->tpl_vars['ch']->value;?>
" 
                <?php if ($_smarty_tpl->tpl_vars['ch']->value == $_smarty_tpl->tpl_vars['chapter']->value) {?> selected="selected"<?php }?>><?php echo $_smarty_tpl->tpl_vars['ch']->value;?>
</option>
            <?php
}
}
$_smarty_tpl->smarty->ext->_foreach->restore($_smarty_tpl, 1);?>
        </select>

    </div>
</nav><?php }
}
