<nav>
    <div class="nav-wrapper">
        <a href="#" class="brand-logo right">Concordance</a>

        <select class="book left">
            {foreach $books as $bk}
                <option value="{$bk.id}" chapters="{$bk.chapters}" 
                {if $book eq $bk.id} selected="selected"{/if}>{$bk.name}</option>
            {/foreach}
        </select>

        <select class="chapter left">
            {foreach $chapters as $ch}
                <option value="{$ch}" 
                {if $ch eq $chapter} selected="selected"{/if}>{$ch}</option>
            {/foreach}
        </select>

    </div>
</nav>