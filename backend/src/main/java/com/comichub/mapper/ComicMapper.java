package com.comichub.mapper;

import com.comichub.dto.comic.ComicResponse;
import com.comichub.dto.comic.ComicSummaryResponse;
import com.comichub.entity.Comic;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ComicMapper {

    @Mapping(source = "author.id", target = "authorId")
    @Mapping(source = "author.displayName", target = "authorName")
    ComicResponse toResponse(Comic comic);

    @Mapping(source = "author.displayName", target = "authorName")
    ComicSummaryResponse toSummaryResponse(Comic comic);
}