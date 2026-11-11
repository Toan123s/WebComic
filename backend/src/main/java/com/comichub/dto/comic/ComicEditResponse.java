package com.comichub.dto.comic;

public record ComicEditResponse(
        ComicResponse comic,
        ComicRevisionResponse pendingRevision
) {
}
