<nav>
    <div class="nav-wrapper">
        <span class="brand-logo center"></span>
        <ul id="slide-out" class="sidenav">
            <li>
                <div class="user-view">
                    <div class="background"></div>
                    <a href="#/">
                        <span class="circle"></span>
                    </a>
                    <span>&nbsp;</span>
                </div>
            </li>
            
            <?php foreach($books as $key => $book) : ?>
            <li>
                <a href="?book=<?=$key + 1;?>" class="waves-effect">
                    <?=$book;?>
                </a>
            </li>
            <?php endforeach; ?>
        </ul>

        <a href="#" data-target="slide-out" class="sidenav-trigger show-on-large">
            <i class="material-icons">menu</i>
        </a>
    </div>
</nav>