import axios from "axios";
import React from "react";
import ArtistCarousel from "../Carousel/Carousel";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Spinner from "react-bootstrap/Spinner";

const baseUrl = import.meta.env.VITE_API_BACKEND_URI;

interface SearchBarProps {
  onArtistSelect: (artistId: string) => void;
  onClear: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onArtistSelect, onClear }) => {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [searchResults, setSearchResults] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [carouselKey, setCarouselKey] = React.useState(0);
  const [hasSearched, setHasSearched] = React.useState(false);

  const handleClear = () => {
    setSearchTerm("");
    setSearchResults([]);
    setCarouselKey((prev) => prev + 1);
    setLoading(false);
    setHasSearched(false);
    onClear();
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    setLoading(true);
    setHasSearched(true);
    try {
      const res = await axios.get(
        `${baseUrl}/api/artists/search/${encodeURIComponent(searchTerm.trim())}`
      );
      setSearchResults(res.data._embedded?.results || []);
      setCarouselKey((prev) => prev + 1);
    } catch (error) {
      console.error("Error fetching search results:", error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-100 mt-4">
      <InputGroup>
        <Form.Control
          placeholder="Please enter an artist name."
          aria-label="Search input"
          className="py-2"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <Button
          variant="primary"
          onClick={handleSearch}
          disabled={loading || !searchTerm.trim()}
          style={{
            backgroundColor:
              loading || !searchTerm.trim() ? "#5a9bb5" : "#3a6c8e",
            borderColor: loading || !searchTerm.trim() ? "#5a9bb5" : "#3a6c8e",
          }}
        >
          Search
          {loading && (
            <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
              className="ms-2"
            />
          )}
        </Button>
        <Button variant="secondary" onClick={handleClear} disabled={loading}>
          Clear
        </Button>
      </InputGroup>

      {searchResults.length > 0 && (
        <ArtistCarousel
          key={carouselKey}
          items={searchResults}
          onArtistSelect={onArtistSelect}
        />
      )}

      {!loading &&
        hasSearched &&
        searchTerm.trim() &&
        searchResults.length === 0 && (
          <div className="w-100 d-flex justify-content-center mt-4">
            <div
              className="w-100 p-3"
              style={{
                maxWidth: "3000px",
                backgroundColor: "#f8d7da",
                border: "1px solid #f5c2c7",
                color: "#842029",
                borderRadius: "0.375rem",
                textAlign: "left",
              }}
            >
              No results found.
            </div>
          </div>
        )}
    </div>
  );
};

export default SearchBar;
