package com.comichub.mapper;

import com.comichub.dto.comic.ComicRevisionResponse;
import com.comichub.entity.ComicRevision;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ComicRevisionMapper {

    @Mapping(source = "comic.id", target = "comicId")
    @Mapping(source = "submittedBy.username", target = "submittedBy")
    @Mapping(source = "reviewer.username", target = "reviewedBy")
    ComicRevisionResponse toResponse(ComicRevision revision);
}
