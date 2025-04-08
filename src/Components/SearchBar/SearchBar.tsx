import axios from "axios";
import React from "react";
import ArtistCarousel from "../Carousel/Carousel";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Spinner from "react-bootstrap/Spinner";

interface SearchBarProps {
  onArtistSelect: (artistId: string) => void;
  onClear: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onArtistSelect, onClear }) => {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [searchResults, setSearchResults] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [carouselKey, setCarouselKey] = React.useState(0);
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const handleClear = () => {
    setSearchTerm("");
    setSearchResults([]);
    setCarouselKey((prev) => prev + 1);
    setLoading(false);
    onClear();
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:5001/api/artists/search/${encodeURIComponent(
          searchTerm.trim()
        )}`
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
    <div className="container-fluid mt-5" style={{ padding: "0px !important" }}>
      <InputGroup style={{ width: "75vw", marginBottom: "20px" }}>
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
        <Button
          variant="outline-secondary"
          onClick={handleClear}
          disabled={loading}
        >
          Clear
        </Button>
      </InputGroup>

      {/* Only show carousel if user is logged in */}
      {user && searchResults.length > 0 && (
        <ArtistCarousel
          key={carouselKey}
          items={searchResults}
          onArtistSelect={onArtistSelect}
        />
      )}
    </div>
  );
};

export default SearchBar;
