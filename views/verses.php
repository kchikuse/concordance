<div class="verses row">
    <?php $verses = GetVerses(1, 1); ?>
    <?php foreach($verses as $verse) : ?>
        <p><?= $verse["verse"]; ?> <?= $verse["text"]; ?></p>
    <?php endforeach; ?>
</div>