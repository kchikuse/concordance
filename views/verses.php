<div class="verses row">
    <?php foreach($verses as $verse) : ?>
        <p><?= $verse["verse"]; ?> <?= $verse["text"]; ?></p>
    <?php endforeach; ?>
</div>